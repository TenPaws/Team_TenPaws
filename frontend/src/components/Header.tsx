import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import useUserStore from "../store/store";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Zustand 사용자 역할 가져오기
  const setRoleSave = useUserStore((state) => state.setRole); 
  
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("이미 로그아웃 되어 있는 상태입니다.");
      setIsLoggedIn(false);
      localStorage.removeItem("isSocialLogin");
      navigate("/");
      return;
    }

    try {
      const authHeader = accessToken.startsWith("Bearer ")
        ? accessToken
        : `Bearer ${accessToken}`;

      const response = await axiosInstance.post(
        "/logout",
        {},
        { headers: { Authorization: authHeader } }
      );

      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isSocialLogin");
        setIsLoggedIn(false);
        alert("로그아웃 되었습니다.");
        window.dispatchEvent(new Event("storage"));
        navigate("/");
      }
    } catch (error) {
      alert("로그아웃을 할 수 없습니다.");
      console.error("로그아웃 실패:", error);
    }
  };

  const handleAiMatchingClick = () => {
    if (!isLoggedIn) {
      alert("로그인을 해주세요."); // 알림 메시지
      navigate("/login"); // 로그인 페이지로 이동
    } else {
      navigate("/ai-matching"); // AI 매칭 페이지로 이동
    }
  };

  const handleMyPageClick = () => {
    if (!isLoggedIn) {
      alert("로그인을 해주세요."); // 알림 메시지
      navigate("/login"); // 로그인 페이지로 이동
    } else {
      navigate(userRole === "ROLE_SHELTER" ? "/mypage-shelter" : "/mypage-user"); // 역할에 따른 마이페이지로 이동
    }
  };


  useEffect(() => {
    const updateLoginState = () => {
      const accessToken = localStorage.getItem("accessToken");
  
      setIsLoggedIn(!!accessToken);
  
      if (accessToken) {
        const authHeader = accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`;
  
        axiosInstance
          .get("/api/v1/features/role", {
            headers: { Authorization: authHeader },
          })
          .then((response) => {
            setUserRole(response.data.role || null);
            setRoleSave(response.data.role || null); // zustand 상태 저장
          })
          .catch((error) => {
            setIsLoggedIn(false);
            setUserRole(null);
            setRoleSave(null) // zustand 상태 저장
            console.error("사용자 역할 가져오기 실패:", error);
          });
      } else {
        setUserRole(null);
      }
    };

  
    updateLoginState();
  
    const handleStorageChange = () => {
      updateLoginState();
    };
  
    window.addEventListener("storage", handleStorageChange);
  
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  

  return (
    <>
      <header className="relative z-50 flex items-center justify-between px-10 py-3 bg-white shadow-md sm:py-3 md:py-3 lg:py-3 xl:py-3">
        {/* TENPAWS - 프로젝트명 */}
        <div
          className="text-4xl font-bold md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl"
          style={{ color: "#7F5546" }}
        >
          <Link to="/">Ten<span className="text-[#f1a34a]">Paws</span></Link>
        </div>

        {/* 동물 찾기, AI매칭, 주변 반려시설, 공지사항, 마이페이지 */}
        <div className="relative justify-center flex-1 hidden md:flex">
          <div className="flex items-center justify-between w-full max-w-3xl px-0 py-3 font-medium rounded-lg text-md ">
            {/* 동물 찾기 */}
            <div
              className="relative flex-1 text-center transition-transform duration-200 hover:scale-105"
            >
              <Link to="/matching">동물 찾기</Link>
            </div>
            {/* AI매칭 */}
            <div
              className="relative flex-1 text-center transition-transform duration-200 hover:scale-105"
              onClick={handleAiMatchingClick} // 클릭 이벤트 추가
            >
              <span className="cursor-pointer">AI 매칭</span>
            </div>
            {/* 주변 반려시설 */}
            <div
              className="relative flex-1 text-center transition-transform duration-200 hover:scale-105"
            >
              <Link to="/guide/facilities">주변 반려시설</Link>
            </div>
            {/* 공지사항 */}
            <div
              className="relative flex-1 text-center transition-transform duration-200 hover:scale-105"
            >
              <Link to="/guide/announcement">공지사항</Link>
            </div>
            {/* 마이페이지 */}
            <div
              className="relative flex-1 text-center transition-transform duration-200 hover:scale-105"
              onClick={handleMyPageClick} // 클릭 이벤트 추가
            >
              <span className="cursor-pointer">마이페이지</span>
            </div>
          </div>
        </div>


        {/* 일반 헤더: 로그인/알림 아이콘 */}
        {/* 로그인이 되어 있지 않은 경우 회원가입 버튼 / 로그인이 되어 있는 경우 알림 버튼으로 구현 */}
        <div className="hidden text-xl font-medium md:block">
          {!isLoggedIn ? (
            <Link to="/login" className="hover:text-gray-700">
              <span style={{ visibility: "hidden" }}>%</span>로그인
            </Link>
          ) : (
            <div className="flex items-center justify-center">
              <Link to="/alarm">
                <img
                  src="/alarm.svg"
                  alt="Alarm Icon"
                  className="cursor-pointer w-9 h-9"
                />
              </Link>
              <div
                className="flex items-center justify-end w-full ml-3 cursor-pointer hover:scale-105"
                onClick={handleLogout}
              >
                <span className="text-sm font-medium text-black sm:text-base md:text-base lg:text-lg xl:text-xl">
                  로그아웃
                </span>
                <img
                  src="/logout.svg"
                  alt="Logout Icon"
                  className="w-6 h-6 ml-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* 모바일 헤더 */}
        <button
          onClick={toggleSidebar}
          className="flex justify-end flex-1 md:hidden"
        >
          <img src="/side.svg" alt="Side menu" className="w-12 h-16 cursor-pointer" />
        </button>

        {/* 사이드바 */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="fixed inset-0 bg-gray-800 bg-opacity-50"
              onClick={toggleSidebar}
            ></div>
            <div className="fixed top-0 right-0 z-50 flex flex-col w-3/4 h-full max-w-sm bg-white shadow-lg">
              <div className="flex items-center justify-between px-5 py-5 bg-black">
                <Link
                  to="/"
                  className="max-[520px]:text-xl text-2xl font-bold transition-transform text-mainColor hover:scale-105"
                >
                  HOME
                </Link>
                <div className="flex items-center">
                  {!isLoggedIn ? (
                    <Link
                      to="/login"
                      className="pr-5 max-[520px]:text-xl text-2xl font-semibold transition-transform text-mainColor hover:scale-105"
                    >
                      로그인
                    </Link>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="pr-5 max-[520px]:text-xl text-2xl font-semibold transition-colors text-mainColor hover:scale-105"
                    >
                      로그아웃
                    </button>
                  )}
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center mx-5 transition-transform hover:scale-105"
                  >
                    <img
                      src="/x.svg"
                      alt="Close sidebar"
                      className="w-10 h-10"
                    />
                  </button>
                </div>
              </div>
              <nav className="flex flex-col flex-grow">
                {[
                  {
                    name: "매칭",
                    link: "#",
                    items: [
                      { name: "반려동물 조회", link: "/matching" },
                      { name: "반려동물 등록", link: "/detailadd", role: "ROLE_SHELTER" }, // ROLE_SHELTER 조건 추가
                      { name: "AI 매칭 시스템", link: "/ai-matching" },
                    ],
                  },
                  {
                    name: "안내",
                    link: "#",
                    items: [
                      { name: "공지사항", link: "/guide/announcement" },
                      { name: "반려동물 관련 시설", link: "/guide/facilities" },
                      { name: "산책 코스", link: "/guide/walking-course" },
                    ],
                  },
                  {
                    name: "내정보",
                    link: "#",
                    items: [
                      { name: "나의 정보", link: userRole === "ROLE_SHELTER" ? "/mypage-shelter" : "/mypage-user" },
                      { name: "선호동물 입력 및 수정", link: "/prefer" },
                    ],
                  },
                  ...(isLoggedIn
                    ? [{ name: "알림", link: "/alarm", items: [] }]
                    : []),
                ]
                  .map((section) => ({
                    ...section,
                    items: section.items.filter((item) => !item.role || item.role === userRole), // role 기반 필터링
                  }))
                  .map((section) => (
                    <div
                      key={section.name}
                      onMouseEnter={() => setExpandedSection(section.name)}
                      onMouseLeave={() => setExpandedSection(null)}
                      className={`relative group ${
                        ["매칭", "안내", "내정보", "알림"].includes(section.name)
                          ? "bg-[#FCF7F7]"
                          : ""
                      }`}
                    >
                      {section.link === "#" ? (
                        <span
                          className="block p-5 text-3xl font-medium transition-transform hover:scale-105"
                        >
                          {section.name}
                        </span>
                      ) : (
                        <Link
                          to={section.link}
                          className="block p-5 text-3xl font-medium transition-transform hover:scale-105"
                        >
                          {section.name}
                        </Link>
                      )}
                      <div className="h-px bg-[#E3E2E2]"></div>
                      {expandedSection === section.name && section.items.length > 0 && (
                        <div className="bg-[#ffffff]">
                          {section.items.map((item, index) => (
                            <div key={index}>
                              <Link
                                to={item.link}
                                className="block p-5 text-2xl transition-transform pl-7 hover:scale-105"
                              >
                                {item.name}
                              </Link>
                              <div className="h-px bg-[#E3E2E2]"></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
