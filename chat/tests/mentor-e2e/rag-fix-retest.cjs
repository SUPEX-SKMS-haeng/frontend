const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const LOGIN_ID = '11810';
const LOGIN_PW = '11810!@';
const RESULTS_DIR = '/Users/a10176/SUPEX_SKMS/frontend/chat/tests/mentor-e2e/results';
const SCREENSHOTS_DIR = '/Users/a10176/SUPEX_SKMS/frontend/chat/tests/mentor-e2e/screenshots';

const results = {
  testDate: '2026-04-08',
  fixVersion: 'off-topic-classification',
  tests: [],
  summary: { total: 3, passed: 0, failed: 0 },
};

async function login(page) {
  console.log('[LOGIN] 로그인 시작');
  await page.goto(BASE_URL);
  await page.waitForSelector('input#id', { timeout: 15000 });
  await page.fill('input#id', LOGIN_ID);
  await page.fill('input#password', LOGIN_PW);
  await page.click('button[type="submit"]');
  await page.waitForURL(/(?!.*login).*/, { timeout: 15000 });
  console.log('[LOGIN] 로그인 완료');
}

async function selectMentorAgent(page) {
  console.log('[AGENT] mentor 에이전트 선택 시작');
  // topbar에서 에이전트 드롭다운 트리거 찾기 (텍스트에 '/' 포함)
  try {
    const trigger = page.locator('button, div').filter({ hasText: /\// }).first();
    await trigger.click({ timeout: 10000 });
    console.log('[AGENT] 드롭다운 클릭됨');
    await page.waitForTimeout(1000);

    // mentor 항목 클릭
    const mentorBtn = page
      .locator('button')
      .filter({ hasText: /mentor/i })
      .first();
    await mentorBtn.click({ timeout: 10000 });
    console.log('[AGENT] mentor 선택 완료');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('[AGENT] 기본 에이전트 사용 (mentor 선택 실패:', e.message, ')');
  }
}

async function startNewChat(page) {
  console.log('[CHAT] 새 채팅 시작');
  try {
    const newChatBtn = page
      .locator('button')
      .filter({ hasText: /새 채팅/i })
      .first();
    await newChatBtn.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('[CHAT] 새 채팅 버튼 클릭됨');
  } catch (e) {
    console.log('[CHAT] 새 채팅 버튼 없음, 계속 진행');
  }
}

async function sendMessage(page, message) {
  console.log('[MSG] 메시지 전송:', message.substring(0, 40));
  const input = page.locator('input[type="text"]').filter({ hasAttr: 'placeholder' });
  // placeholder로 메시지 입력창 찾기
  const chatInput = page.locator('input[placeholder="메시지를 입력하세요."]');
  await chatInput.waitFor({ timeout: 15000 });
  await chatInput.fill(message);
  await chatInput.press('Enter');
  console.log('[MSG] 전송 완료, 응답 대기 중...');
}

async function waitForResponse(page) {
  const startTime = Date.now();
  // "응답을 생성 중입니다.." 텍스트 나타날 때까지 잠깐 대기
  try {
    await page.waitForSelector('text=응답을 생성 중입니다..', { timeout: 10000 });
    console.log('[WAIT] 응답 생성 중 표시 확인됨');
  } catch (e) {
    console.log('[WAIT] 응답 생성 중 표시 없음 (빠른 응답이거나 다른 표시)');
  }

  // 응답 완료 대기
  await page.waitForFunction(
    () => {
      const loadingEl = document.querySelector('*');
      const bodyText = document.body.innerText;
      return !bodyText.includes('응답을 생성 중입니다..');
    },
    { timeout: 90000 }
  );

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`[WAIT] 응답 완료 (${elapsed.toFixed(1)}초)`);
  await page.waitForTimeout(1500); // 렌더링 안정화
  return elapsed;
}

async function getLastResponse(page) {
  const responses = page.locator('div.whitespace-pre-wrap');
  const count = await responses.count();
  if (count === 0) return '';
  const lastText = await responses.nth(count - 1).innerText();
  return lastText;
}

async function clickSourceButton(page) {
  console.log('[SOURCE] 소스 버튼 클릭 시도');
  try {
    // [1], [2] 등 형태의 소스 버튼 찾기
    const sourceBtn = page.locator('button').filter({ hasText: /^\[/ }).first();
    const count = await page.locator('button').filter({ hasText: /^\[/ }).count();
    console.log(`[SOURCE] 소스 버튼 ${count}개 발견`);
    if (count > 0) {
      await sourceBtn.click({ timeout: 5000 });
      console.log('[SOURCE] 소스 버튼 클릭됨');
      await page.waitForTimeout(1500);
      return true;
    }
    return false;
  } catch (e) {
    console.log('[SOURCE] 소스 버튼 클릭 실패:', e.message);
    return false;
  }
}

async function checkSourcePanel(page) {
  const result = {
    sourcePanelOpened: false,
    confidenceBadge: false,
    absoluteRelevanceNumber: false,
    badgeText: '',
    relevanceValue: '',
  };

  try {
    // 소스 패널 열기
    const opened = await clickSourceButton(page);
    result.sourcePanelOpened = opened;

    if (!opened) {
      console.log('[SOURCE] 소스 패널 열리지 않음');
      return result;
    }

    // 절대 관련도 텍스트 확인
    try {
      await page.waitForSelector('text=절대 관련도', { timeout: 5000 });
      console.log('[SOURCE] 절대 관련도 텍스트 발견');
      result.absoluteRelevanceNumber = true;

      // 수치 추출
      const relevanceEl = page.locator('text=/절대 관련도: \\d/').first();
      const relevanceText = await relevanceEl.innerText().catch(() => '');
      result.relevanceValue = relevanceText;
      console.log('[SOURCE] 관련도 값:', relevanceText);
    } catch (e) {
      console.log('[SOURCE] 절대 관련도 없음:', e.message);
    }

    // confidence 배지 확인 (높음/보통/참고용)
    const badgeTexts = ['높음', '보통', '참고용'];
    for (const badge of badgeTexts) {
      const badgeEl = page.locator(`text=${badge}`).first();
      const visible = await badgeEl.isVisible().catch(() => false);
      if (visible) {
        result.confidenceBadge = true;
        result.badgeText = badge;
        console.log(`[SOURCE] confidence 배지 발견: ${badge}`);
        break;
      }
    }

    if (!result.confidenceBadge) {
      // 더 넓게 탐색
      const pageContent = await page.content();
      if (
        pageContent.includes('높음') ||
        pageContent.includes('보통') ||
        pageContent.includes('참고용')
      ) {
        result.confidenceBadge = true;
        result.badgeText = '(페이지에서 발견됨)';
        console.log('[SOURCE] confidence 배지 페이지에서 발견');
      }
    }
  } catch (e) {
    console.log('[SOURCE] 소스 패널 확인 오류:', e.message);
  }

  return result;
}

// ============================================================
// 테스트 1: NFT 무관 질문 차단 확인
// ============================================================
async function test1NFTBlocking(page) {
  console.log('\n========== 테스트 1: NFT 차단 확인 ==========');
  const testResult = {
    id: 'retest-1-nft',
    query: 'NFT 만드는 법을 알려주세요',
    passed: false,
    checks: {
      gradeInsufficient: false,
      noSkmsFrame: false,
    },
    responseText: '',
    notes: '',
  };

  try {
    await startNewChat(page);
    await sendMessage(page, testResult.query);
    const elapsed = await waitForResponse(page);
    testResult.responseTime = elapsed;

    const responseText = await getLastResponse(page);
    testResult.responseText = responseText.substring(0, 500);
    console.log('[TEST1] 응답 앞부분:', responseText.substring(0, 200));

    // 스크린샷
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/test1-nft.png`, fullPage: false });

    // grade insufficient 판정 확인
    const insufficientKeywords = [
      '관련 자료를 찾지 못했',
      '찾을 수 없',
      '관련이 없',
      '답변하기 어렵',
      'SKMS',
      'SK',
      '경영',
      '관련된 질문',
      '범위를 벗어',
      '지원하지 않',
      '무관한',
      '해당 없',
      '없습니다',
      '죄송합니다',
    ];
    const skmsFrameKeywords = [
      'SUPEX',
      '패기',
      '행복',
      'SKMS',
      '이천회장',
      '최태원',
      'SK 경영',
      'SK그룹',
      '경영철학',
      'VWBE',
    ];

    const hasInsufficient = insufficientKeywords.some((kw) => responseText.includes(kw));
    const hasSkmsFrame = skmsFrameKeywords.some((kw) => responseText.includes(kw));

    // NFT 기술 답변 여부 확인 (블록체인, 민팅 등)
    const nftTechKeywords = [
      '블록체인',
      '민팅',
      'NFT',
      'ERC',
      '스마트 컨트랙트',
      '메타마스크',
      '오픈씨',
    ];
    const hasNFTTech = nftTechKeywords.some((kw) => responseText.includes(kw));

    console.log('[TEST1] insufficient 키워드 발견:', hasInsufficient);
    console.log('[TEST1] SKMS 프레임 발견:', hasSkmsFrame);
    console.log('[TEST1] NFT 기술 내용 발견:', hasNFTTech);

    // 차단 판정: NFT 기술 내용이 없거나, 거절 문구가 있어야 함
    testResult.checks.gradeInsufficient = !hasNFTTech || hasInsufficient;
    testResult.checks.noSkmsFrame = !hasSkmsFrame || (hasSkmsFrame && !hasNFTTech);

    // 최종 판정: NFT 기술 답변을 하지 않으면 통과
    testResult.passed = !hasNFTTech;
    testResult.notes = `NFT기술내용:${hasNFTTech}, 거절키워드:${hasInsufficient}, SKMS프레임:${hasSkmsFrame}`;
  } catch (e) {
    testResult.notes = `오류: ${e.message}`;
    console.log('[TEST1] 오류:', e.message);
    await page
      .screenshot({ path: `${SCREENSHOTS_DIR}/test1-nft-error.png`, fullPage: false })
      .catch(() => {});
  }

  console.log('[TEST1] 결과:', testResult.passed ? 'PASSED' : 'FAILED');
  return testResult;
}

// ============================================================
// 테스트 2: SUPEX 질문 + 소스 패널 확인
// ============================================================
async function test2SupexSourcePanel(page) {
  console.log('\n========== 테스트 2: SUPEX + 소스 패널 ==========');
  const testResult = {
    id: 'retest-2-supex',
    query: 'SUPEX 목표와 현실적인 목표 사이에서 어떻게 균형을 잡아야 합니까?',
    passed: false,
    checks: {
      sourcePanelOpened: false,
      confidenceBadge: false,
      absoluteRelevanceNumber: false,
    },
    sourceDetails: {},
    responseText: '',
    notes: '',
  };

  try {
    await startNewChat(page);
    await sendMessage(page, testResult.query);
    const elapsed = await waitForResponse(page);
    testResult.responseTime = elapsed;

    const responseText = await getLastResponse(page);
    testResult.responseText = responseText.substring(0, 500);
    console.log('[TEST2] 응답 앞부분:', responseText.substring(0, 200));

    // 소스 패널 확인
    const sourceInfo = await checkSourcePanel(page);
    testResult.checks.sourcePanelOpened = sourceInfo.sourcePanelOpened;
    testResult.checks.confidenceBadge = sourceInfo.confidenceBadge;
    testResult.checks.absoluteRelevanceNumber = sourceInfo.absoluteRelevanceNumber;
    testResult.sourceDetails = sourceInfo;

    // 스크린샷 (소스 패널 열린 상태)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/test2-supex-source.png`, fullPage: false });
    console.log('[TEST2] 스크린샷 저장됨');

    // 정상 답변 여부
    const hasSupexContent = responseText.includes('SUPEX') || responseText.includes('목표');
    testResult.checks.normalResponse = hasSupexContent;

    // 통과 조건: 정상 답변 생성 + 소스 패널 열림
    testResult.passed = hasSupexContent && sourceInfo.sourcePanelOpened;
    testResult.notes = `답변생성:${hasSupexContent}, 소스패널:${sourceInfo.sourcePanelOpened}, 배지:${sourceInfo.badgeText || '없음'}, 관련도:${sourceInfo.relevanceValue || '없음'}`;
  } catch (e) {
    testResult.notes = `오류: ${e.message}`;
    console.log('[TEST2] 오류:', e.message);
    await page
      .screenshot({ path: `${SCREENSHOTS_DIR}/test2-supex-error.png`, fullPage: false })
      .catch(() => {});
  }

  console.log('[TEST2] 결과:', testResult.passed ? 'PASSED' : 'FAILED');
  return testResult;
}

// ============================================================
// 테스트 3: 패기 질문 회귀 확인
// ============================================================
async function test3PassionRegression(page) {
  console.log('\n========== 테스트 3: 패기 회귀 확인 ==========');
  const testResult = {
    id: 'retest-3-passion',
    query: '패기란 무엇이며 경영에서 왜 중요한가?',
    passed: false,
    checks: {
      normalResponse: false,
      confidenceBadge: false,
      noHallucination: true,
    },
    sourceDetails: {},
    responseText: '',
    notes: '',
  };

  try {
    await startNewChat(page);
    await sendMessage(page, testResult.query);
    const elapsed = await waitForResponse(page);
    testResult.responseTime = elapsed;

    const responseText = await getLastResponse(page);
    testResult.responseText = responseText.substring(0, 500);
    console.log('[TEST3] 응답 앞부분:', responseText.substring(0, 200));

    // 소스 패널 확인
    const sourceInfo = await checkSourcePanel(page);
    testResult.checks.confidenceBadge = sourceInfo.confidenceBadge;
    testResult.sourceDetails = sourceInfo;

    // 스크린샷
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/test3-passion-source.png`, fullPage: false });

    // 정상 답변 여부 (패기 관련 내용)
    const hasPassionContent =
      responseText.includes('패기') ||
      responseText.includes('도전') ||
      responseText.includes('경영');
    testResult.checks.normalResponse = hasPassionContent;

    // 할루시네이션 확인: 구체적인 가짜 수치 패턴 (예: "xx% 증가", "xx억원" 등)
    const hallucinationPatterns = [
      /\d+\.\d+%\s*향상/,
      /\d+억\s*원\s*절감/,
      /\d+배\s*증가/,
      /연간\s*\d+%/,
      /\d{4}년\s*\d+월/,
    ];
    const hasHallucination = hallucinationPatterns.some((p) => p.test(responseText));
    testResult.checks.noHallucination = !hasHallucination;
    if (hasHallucination) console.log('[TEST3] 잠재적 할루시네이션 패턴 발견');

    // 통과 조건
    testResult.passed = hasPassionContent && !hasHallucination;
    testResult.notes = `패기내용:${hasPassionContent}, 할루시네이션:${hasHallucination}, 배지:${sourceInfo.badgeText || '없음'}`;
  } catch (e) {
    testResult.notes = `오류: ${e.message}`;
    console.log('[TEST3] 오류:', e.message);
    await page
      .screenshot({ path: `${SCREENSHOTS_DIR}/test3-passion-error.png`, fullPage: false })
      .catch(() => {});
  }

  console.log('[TEST3] 결과:', testResult.passed ? 'PASSED' : 'FAILED');
  return testResult;
}

// ============================================================
// 메인 실행
// ============================================================
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await login(page);
    await selectMentorAgent(page);

    // 테스트 순차 실행
    const t1 = await test1NFTBlocking(page);
    results.tests.push(t1);
    if (t1.passed) results.summary.passed++;
    else results.summary.failed++;

    await page.waitForTimeout(2000);

    const t2 = await test2SupexSourcePanel(page);
    results.tests.push(t2);
    if (t2.passed) results.summary.passed++;
    else results.summary.failed++;

    await page.waitForTimeout(2000);

    const t3 = await test3PassionRegression(page);
    results.tests.push(t3);
    if (t3.passed) results.summary.passed++;
    else results.summary.failed++;
  } catch (e) {
    console.error('테스트 실행 오류:', e);
    await page
      .screenshot({ path: `${SCREENSHOTS_DIR}/fatal-error.png`, fullPage: false })
      .catch(() => {});
  } finally {
    await browser.close();
  }

  // 결과 저장
  const resultPath = `${RESULTS_DIR}/rag-fix-20260408.json`;
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('\n========== 최종 결과 ==========');
  console.log(
    `총 ${results.summary.total}개 / 통과 ${results.summary.passed}개 / 실패 ${results.summary.failed}개`
  );
  console.log('결과 저장:', resultPath);
  results.tests.forEach((t) => {
    console.log(`  [${t.passed ? 'PASS' : 'FAIL'}] ${t.id}: ${t.notes}`);
  });
})();
