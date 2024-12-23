import React, { useState, useEffect } from "react";
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

  const shelter = userRole == "ROLE_SHELTER"
  


  return (
    <>
      <header className="relative z-50 flex items-center justify-between px-10 py-3 bg-white shadow-md sm:py-3 md:py-3 lg:py-3 xl:py-3">
        {/* TENPAWS - 프로젝트명 */}
        <div
          className="text-4xl font-bold md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl"
          style={{ color: "#7F5546" }}
        >
          <Link to="/">Ten<span className="text-mainColor">Paws</span></Link>
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
            >
              <Link to={isLoggedIn ? "/ai-matching" : "/login"}>AI 매칭</Link>
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
            >
              {shelter ? <Link to="/mypage-shelter">마이페이지</Link> : <Link to="/mypage-user">마이페이지</Link>}
            </div>
          </div>
        </div>

        {/* 일반 헤더: 회원가입/알림 아이콘 */}
        {/* 로그인이 되어 있지 않은 경우 회원가입 버튼 / 로그인이 되어 있는 경우 알림 버튼으로 구현 */}
        <div className="hidden text-2xl font-medium md:block">
          {!isLoggedIn ? (
            <Link to="/signup" className="hover:text-gray-700">
              회원가입
            </Link>
          ) : (
            <div className="flex items-center">
              <Link to="/alarm">
                <img
                  src="/alarm.svg"
                  alt="Alarm Icon"
                  className="cursor-pointer w-9 h-9"
                />
              </Link>
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
              <div className="flex items-center justify-between px-6 py-5 bg-[#D7B8A3]">
                <Link
                  to="/"
                  className="text-3xl font-bold text-white transition-transform hover:scale-105"
                >
                  HOME
                </Link>
                <div className="flex items-center">
                  {!isLoggedIn ? (
                    <Link
                      to="/signup"
                      className="pr-5 text-3xl font-semibold text-white transition-transform hover:scale-105"
                    >
                      회원가입
                    </Link>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="pr-5 text-3xl font-semibold text-white transition-colors hover:scale-105"
                    >
                      로그아웃
                    </button>
                  )}
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center ml-5 transition-transform hover:scale-105"
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
