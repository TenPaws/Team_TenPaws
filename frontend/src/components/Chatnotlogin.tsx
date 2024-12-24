import { useState, useRef, useEffect } from "react";
import FAQ from "./FAQ";


const Chatnotlogin = () => {
  const [isopen, setIsOpen] = useState(false);
  const [fnqopen, setFnqopen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFnqopen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChatClick = () => {
    if (!isopen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(true);
        setFnqopen(true);
      }, 50);
    } else {
      setIsOpen(false);
      setFnqopen(false);
    }
  };

  const handlefnqopen = () => {
    setFnqopen(true);
  };

  const handleUnauthorizedClick = () => {
    setShowLoginMessage(true);
    setTimeout(() => {
      setShowLoginMessage(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-[89px] right-2 z-50">
      <div ref={modalRef}>
        <div>
          {/* 채팅 문의 버튼*/}
          <div
            className="fixed bottom-0 right-0 z-50 bg-[#f1a34a] p-4 text-xl font-bold rounded-tl-xl cursor-pointer"
            onClick={handleChatClick}>
            💬 채팅 문의
          </div>

          {(isopen || isAnimating) && (
            <div
              className={`bg-white fixed bottom-20 right-6 z-50 w-[450px] h-[800px] rounded-xl 
              shadow-[0_0_15px_rgba(0,0,0,0.2)] flex flex-col
              transform transition-all duration-300 ease-in-out
              ${isopen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              onTransitionEnd={() => {
                if (!isopen) setIsAnimating(false);
              }}>
              <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                {fnqopen && <FAQ isOpen={fnqopen} onClose={() => setFnqopen(false)} />}

                {showLoginMessage && (
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    bg-gray-300 px-6 py-3 rounded-lg shadow-lg text-center
                    transition-opacity duration-300">
                    로그인이 필요합니다.
                  </div>
                )}
              </div>

              <div className="flex justify-around items-center h-20 mt-auto rounded-b-xl">
                <button
                  className="flex-1 flex flex-col justify-center items-center py-2 hover:text-[#f1a34a] transition-colors"
                  onClick={handleUnauthorizedClick}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-1">채팅방 생성</span>
                </button>
                <button
                  className="flex-1 flex flex-col justify-center items-center py-2 hover:text-[#f1a34a] transition-colors"
                  onClick={handleUnauthorizedClick}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V12.5C20 16.9183 16.4183 20.5 12 20.5C10.5 20.5 9.5 20.3 8 19.5L4 20.5L5 16.5C4.5 15.5 4 14 4 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-1">채팅</span>
                </button>
                <button
                  className="flex-1 flex flex-col justify-center items-center py-2 hover:text-[#f1a34a] transition-colors"
                  onClick={handlefnqopen}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 19H12.01V19.01H12V19ZM12 15C12 15 16 11.5 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9M12 15V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-1">FAQ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatnotlogin;
