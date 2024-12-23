export default {
  darkMode: false, 
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainColor: '#f1a34a',
        cancelColor: '#FF1212',
        bgColor: '#3c2a13',
      },
      fontFamily: {
        hakgyo: ['HakgyoansimAllimjangTTF-B', 'sans-serif'], // 학교안심알림장 폰트
        pretendard: ['Pretendard-Regular', 'sans-serif'],    // 프리텐다드 폰트
        ownglyph: ['Ownglyph_ParkDaHyun', 'sans-serif'],     // Ownglyph_ParkDaHyun 폰트
        lineSeed: ['LINESeedKR-Bd', 'sans-serif'],           // 라인 씨드 폰트
        godo: ['Godo', 'sans-serif'],                        // 고도 폰트
        nanum: ['NanumSquareNeoLight', 'sans-serif'],        // 나눔스퀘어 네오 폰트
        gangwon: ['GangwonEdu_OTFBoldA', 'sans-serif'],      // 강원교육 폰트
        gyeonggi: ['Gyeonggi_Batang_Regular', 'serif'],      // 경기 바탕 폰트
        cafe24: ['Cafe24Nyangi-W-v1.0', 'sans-serif'],       // 카페24 냥이 폰트
        samlip: ['TTSamlipCreamyWhiteR', 'sans-serif'],      // 삼립 크리미 화이트 폰트
        kcc: ['KCC-Ganpan', 'sans-serif'],  
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
