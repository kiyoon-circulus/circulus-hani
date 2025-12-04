// Mock 학생 데이터 생성 함수
const generateMockQuestionRecords = (count) => {
  const questionTypes = ["모음", "자음", "글자", "낱말"];
  const activityTypes = ["읽기", "듣기", "말하기", "쓰기"];
  const records = [];

  for (let i = 0; i < count; i++) {
    const isCorrect = Math.random() > 0.25; // 75% 정답률
    records.push({
      timestamp: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      solvingTime: Math.floor(Math.random() * 60) + 5, // 5-65초
      isCorrect,
      submittedAnswer: isCorrect ? "정답" : "오답",
      correctAnswer: "정답",
      questionText: `문제 ${i + 1}`,
      repetitionCount: Math.floor(Math.random() * 3) + 1,
      questionType:
        questionTypes[Math.floor(Math.random() * questionTypes.length)],
      activityType:
        activityTypes[Math.floor(Math.random() * activityTypes.length)],
    });
  }

  return records.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

const generateMockSessionRecords = (count) => {
  const learningContents = ["모음", "자음", "글자", "낱말"];
  const activityTypes = ["읽기", "듣기", "말하기", "쓰기"];
  const sessions = [];

  for (let i = 0; i < count; i++) {
    const questionsAttempted = Math.floor(Math.random() * 20) + 5;
    const correctAnswers = Math.floor(
      questionsAttempted * (0.6 + Math.random() * 0.3)
    );

    sessions.push({
      sessionId: `session_${i + 1}`,
      studentId: `student_${Math.floor(i / 3) + 1}`,
      startTime: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endTime: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
      ).toISOString(),
      duration: Math.floor(Math.random() * 45) + 15, // 15-60분
      chapterId: `chapter-${Math.floor(Math.random() * 6) + 1}`,
      characterId: Math.floor(Math.random() * 3) + 1,
      learningContent:
        learningContents[Math.floor(Math.random() * learningContents.length)],
      activityType:
        activityTypes[Math.floor(Math.random() * activityTypes.length)],
      questionsAttempted,
      correctAnswers,
      incorrectAnswers: questionsAttempted - correctAnswers,
      concentrationIssues: Math.floor(Math.random() * 3),
    });
  }

  return sessions;
};

// Mock 학생 학습 통계 데이터
export const mockStudentStats = [
  {
    studentId: "student_1",
    studentName: "익명학습자_001",
    groupId: 1,
    characterId: 1,
    totalQuestionsAttempted: 384,
    totalCorrectAnswers: 312,
    totalIncorrectAnswers: 72,
    totalConcentrationIssues: 18,
    currentConsecutiveCorrect: 7,
    maxConsecutiveCorrect: 23,
    totalStudyTimeMinutes: 1260, // 21시간
    questionRecords: generateMockQuestionRecords(384),
    sessionRecords: generateMockSessionRecords(42),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    averageAccuracy: 81.3,
    weeklyProgress: [
      {
        week: "11월 1주",
        questionsAttempted: 45,
        accuracy: 75.6,
        studyTime: 180,
      },
      {
        week: "11월 2주",
        questionsAttempted: 52,
        accuracy: 78.8,
        studyTime: 210,
      },
      {
        week: "11월 3주",
        questionsAttempted: 48,
        accuracy: 83.3,
        studyTime: 195,
      },
      {
        week: "11월 4주",
        questionsAttempted: 56,
        accuracy: 85.7,
        studyTime: 225,
      },
      {
        week: "12월 1주",
        questionsAttempted: 61,
        accuracy: 87.2,
        studyTime: 240,
      },
      {
        week: "12월 2주",
        questionsAttempted: 58,
        accuracy: 89.7,
        studyTime: 210,
      },
      {
        week: "12월 3주",
        questionsAttempted: 64,
        accuracy: 82.8,
        studyTime: 190,
      },
    ],
    activityBreakdown: [
      {
        activityType: "읽기",
        questionsAttempted: 102,
        accuracy: 85.3,
        averageTime: 22.5,
      },
      {
        activityType: "듣기",
        questionsAttempted: 89,
        accuracy: 79.8,
        averageTime: 18.7,
      },
      {
        activityType: "말하기",
        questionsAttempted: 96,
        accuracy: 76.0,
        averageTime: 35.2,
      },
      {
        activityType: "쓰기",
        questionsAttempted: 97,
        accuracy: 84.5,
        averageTime: 42.1,
      },
    ],
    contentTypeProgress: [
      {
        contentType: "모음",
        questionsAttempted: 98,
        accuracy: 88.8,
        completionRate: 92.4,
      },
      {
        contentType: "자음",
        questionsAttempted: 92,
        accuracy: 82.6,
        completionRate: 87.0,
      },
      {
        contentType: "글자",
        questionsAttempted: 108,
        accuracy: 78.7,
        completionRate: 71.3,
      },
      {
        contentType: "낱말",
        questionsAttempted: 86,
        accuracy: 75.6,
        completionRate: 63.2,
      },
    ],
  },
  {
    studentId: "student_2",
    studentName: "익명학습자_002",
    groupId: 1,
    characterId: 2,
    totalQuestionsAttempted: 298,
    totalCorrectAnswers: 223,
    totalIncorrectAnswers: 75,
    totalConcentrationIssues: 24,
    currentConsecutiveCorrect: 4,
    maxConsecutiveCorrect: 18,
    totalStudyTimeMinutes: 945, // 15.75시간
    questionRecords: generateMockQuestionRecords(298),
    sessionRecords: generateMockSessionRecords(35),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    averageAccuracy: 74.8,
    weeklyProgress: [
      {
        week: "11월 1주",
        questionsAttempted: 32,
        accuracy: 68.8,
        studyTime: 120,
      },
      {
        week: "11월 2주",
        questionsAttempted: 38,
        accuracy: 71.1,
        studyTime: 145,
      },
      {
        week: "11월 3주",
        questionsAttempted: 41,
        accuracy: 73.2,
        studyTime: 155,
      },
      {
        week: "11월 4주",
        questionsAttempted: 45,
        accuracy: 75.6,
        studyTime: 170,
      },
      {
        week: "12월 1주",
        questionsAttempted: 48,
        accuracy: 77.1,
        studyTime: 180,
      },
      {
        week: "12월 2주",
        questionsAttempted: 46,
        accuracy: 79.3,
        studyTime: 175,
      },
      {
        week: "12월 3주",
        questionsAttempted: 48,
        accuracy: 76.0,
        studyTime: 160,
      },
    ],
    activityBreakdown: [
      {
        activityType: "읽기",
        questionsAttempted: 78,
        accuracy: 79.5,
        averageTime: 26.3,
      },
      {
        activityType: "듣기",
        questionsAttempted: 72,
        accuracy: 73.6,
        averageTime: 21.8,
      },
      {
        activityType: "말하기",
        questionsAttempted: 74,
        accuracy: 69.9,
        averageTime: 38.5,
      },
      {
        activityType: "쓰기",
        questionsAttempted: 74,
        accuracy: 76.4,
        averageTime: 45.7,
      },
    ],
    contentTypeProgress: [
      {
        contentType: "모음",
        questionsAttempted: 78,
        accuracy: 82.1,
        completionRate: 86.7,
      },
      {
        contentType: "자음",
        questionsAttempted: 76,
        accuracy: 76.3,
        completionRate: 79.2,
      },
      {
        contentType: "글자",
        questionsAttempted: 82,
        accuracy: 71.2,
        completionRate: 58.5,
      },
      {
        contentType: "낱말",
        questionsAttempted: 62,
        accuracy: 67.7,
        completionRate: 45.2,
      },
    ],
  },
  // 더 많은 학생 데이터 추가
  ...Array.from({ length: 46 }, (_, i) => {
    const totalQuestions = Math.floor(Math.random() * 400) + 100;
    const correctAnswers = Math.floor(
      totalQuestions * (0.6 + Math.random() * 0.3)
    );

    return {
      studentId: `student_${i + 3}`,
      studentName: `익명학습자_${String(i + 3).padStart(3, "0")}`,
      groupId: Math.floor(i / 8) + 1,
      characterId: (i % 3) + 1,
      totalQuestionsAttempted: totalQuestions,
      totalCorrectAnswers: correctAnswers,
      totalIncorrectAnswers: totalQuestions - correctAnswers,
      totalConcentrationIssues: Math.floor(Math.random() * 30) + 5,
      currentConsecutiveCorrect: Math.floor(Math.random() * 15),
      maxConsecutiveCorrect: Math.floor(Math.random() * 30) + 10,
      totalStudyTimeMinutes: Math.floor(Math.random() * 1800) + 300,
      questionRecords: generateMockQuestionRecords(totalQuestions),
      sessionRecords: generateMockSessionRecords(
        Math.floor(totalQuestions / 10)
      ),
      lastActivity: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      averageAccuracy: (correctAnswers / totalQuestions) * 100,
      weeklyProgress: Array.from({ length: 7 }, (_, weekIndex) => ({
        week: `${11 + Math.floor(weekIndex / 4)}월 ${(weekIndex % 4) + 1}주`,
        questionsAttempted: Math.floor(Math.random() * 60) + 20,
        accuracy: 60 + Math.random() * 30,
        studyTime: Math.floor(Math.random() * 200) + 100,
      })),
      activityBreakdown: [
        {
          activityType: "읽기",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 70 + Math.random() * 20,
          averageTime: 20 + Math.random() * 15,
        },
        {
          activityType: "듣기",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 70 + Math.random() * 20,
          averageTime: 15 + Math.random() * 15,
        },
        {
          activityType: "말하기",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 60 + Math.random() * 20,
          averageTime: 30 + Math.random() * 20,
        },
        {
          activityType: "쓰기",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 70 + Math.random() * 20,
          averageTime: 40 + Math.random() * 20,
        },
      ],
      contentTypeProgress: [
        {
          contentType: "모음",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 75 + Math.random() * 15,
          completionRate: 60 + Math.random() * 35,
        },
        {
          contentType: "자음",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 70 + Math.random() * 20,
          completionRate: 55 + Math.random() * 35,
        },
        {
          contentType: "글자",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 65 + Math.random() * 20,
          completionRate: 45 + Math.random() * 35,
        },
        {
          contentType: "낱말",
          questionsAttempted: Math.floor(totalQuestions * 0.25),
          accuracy: 60 + Math.random() * 20,
          completionRate: 35 + Math.random() * 35,
        },
      ],
    };
  }),
];

// 전체 학습 통계 데이터
export const mockLearningOverview = {
  totalActiveStudents: mockStudentStats.length,
  totalQuestionsAttempted: mockStudentStats.reduce(
    (sum, student) => sum + student.totalQuestionsAttempted,
    0
  ),
  averageAccuracy:
    mockStudentStats.reduce(
      (sum, student) => sum + student.averageAccuracy,
      0
    ) / mockStudentStats.length,
  totalStudyHours: Math.round(
    mockStudentStats.reduce(
      (sum, student) => sum + student.totalStudyTimeMinutes,
      0
    ) / 60
  ),
  dailyActivity: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toISOString().split("T")[0],
      activeStudents: Math.floor(Math.random() * 35) + 15,
      questionsAttempted: Math.floor(Math.random() * 800) + 200,
      averageAccuracy: 65 + Math.random() * 25,
    };
  }),
  difficultyDistribution: [
    { difficulty: "쉬움", questionsAttempted: 4521, accuracy: 84.2 },
    { difficulty: "보통", questionsAttempted: 3847, accuracy: 76.8 },
    { difficulty: "어려움", questionsAttempted: 2156, accuracy: 68.3 },
  ],
  activityTypeDistribution: [
    { activityType: "읽기", questionsAttempted: 2841, averageAccuracy: 82.4 },
    { activityType: "듣기", questionsAttempted: 2567, averageAccuracy: 78.9 },
    { activityType: "말하기", questionsAttempted: 2398, averageAccuracy: 71.2 },
    { activityType: "쓰기", questionsAttempted: 2718, averageAccuracy: 79.6 },
  ],
  contentTypeDistribution: [
    { contentType: "모음", questionsAttempted: 2756, averageAccuracy: 85.1 },
    { contentType: "자음", questionsAttempted: 2623, averageAccuracy: 79.3 },
    { contentType: "글자", questionsAttempted: 2894, averageAccuracy: 74.8 },
    { contentType: "낱말", questionsAttempted: 2251, averageAccuracy: 69.5 },
  ],
};
