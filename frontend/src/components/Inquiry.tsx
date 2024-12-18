import { useState } from "react";

const Inquiry = () => {
  const [isopen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="fixed bottom-0 right-0 z-50 bg-[#f1a34a] p-4 text-xl font-bold rounded-tl-xl cursor-pointer"
        onClick={() => setIsOpen(!isopen)}>
        💬 채팅 문의
      </div>

      {isopen && (
        <div className="bg-white fixed bottom-20 right-6 z-50 w-96 h-[600px] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex-1 p-4">
            {/* 여기에 선택된 메뉴에 따른 컨텐츠가 들어갈 수 있습니다 */}
          </div>

          <div className="flex justify-around items-center h-14 border-t border-gray-200">
            <button className="flex-1 text-center hover:text-blue-500 py-4">채팅방 생성</button>
            <button className="flex-1 text-center hover:text-blue-500 py-4">채팅</button>
            <button className="flex-1 text-center hover:text-blue-500 py-4">FAQ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiry;
