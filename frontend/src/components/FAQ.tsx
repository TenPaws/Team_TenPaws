import { useEffect, useState } from "react";
import logo from "/logo.png";
import FAQEdIt from "./FAQEdIt";
import axios from "axios";
import useUserStore from "../store/store";

interface TopFAQ {
  faqId: number;
  content: string | number;
  refFaqId: null | number;
  parentId: null | number;
}

// FAQ 컴포넌트의 props 타입 정의 추가
interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQ = ({ isOpen, onClose }: FAQProps) => {
  const [selectFAQ, setSelectFAQ] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [topContent, setTopContent] = useState<TopFAQ[]>([]);
  const [allContent, setAllContent] = useState<TopFAQ[]>([]);
  const [parentId, setParentId] = useState<number | null>(null);
  const role = useUserStore((state) => state.role);

  //작성창 열기
  const handleEditClick = () => {
    setEdit(!edit);
  };

  //FAQ채팅 열기
  const handleClick = () => {
    onClose();
    setSelectFAQ(null);
  };

  //선택한 FAQ만 남기기 & 다시 누르면 전체목록 보이기
  const handleSelectFAQ = (FAQ: string, faqId: number) => {
    if (selectFAQ === FAQ) {
      setSelectFAQ(null);
      setParentId(null);
    } else {
      setSelectFAQ(FAQ);
      setParentId(faqId);
    }
  };

  //처음으로 돌아가기
  const handleBack = () => {
    setSelectFAQ(null);
    setParentId(null);
  };

  //최상위 질문 불러오기
  useEffect(() => {
    const fetchTopFAQ = async () => {
      try {
        const response = await axios.get("http://3.38.196.10:8080/api/v1/faqs/top-level");
        setTopContent(response.data);
      } catch (error) {
        console.error("최상위 질문 불러오기 실패", error);
      }
    };
    fetchTopFAQ();
  }, []);

  //모든 질문 불러오기
  useEffect(() => {
    const fetchAllFAQ = async () => {
      try {
        const response = await axios.get(`http://3.38.196.10:8080/api/v1/faqs`);
        setAllContent(response.data);
      } catch (error) {
        console.error("하위 질문 불러오기 실패", error);
      }
    };
    fetchAllFAQ();
  }, []);

  return (
    <div>
      {isOpen && (
        <>
          <div className=" w-[430px] h-[670px] fixed bottom-[56px] -right-[24px] m-6 z-50 rounded-t-md">
            <div className="font-bold text-xl p-4 flex rounded-t-md content-center justify-between">
              <div>FAQ</div>
              <div className="flex gap-2">
                {role === "ROLE_ADMIN" && (
                  <div className="cursor-pointer float-end" onClick={handleEditClick}>
                    +
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] scrollbar-hide">
              <div className="flex px-5 py-5">
                <div className="w-12 h-12 rounded-full">
                  <img src={logo} alt="logo" />
                </div>
                <div className="content-center p-2 ml-5 bg-gray-200 rounded-xl">어떤 도움이 필요하신가요?</div>
              </div>
              {!selectFAQ ? (
                // 최상위 질문들 표시
                <>
                  {topContent.map((faq) => (
                    <div className="flex justify-end px-5 py-1" key={faq.faqId}>
                      <div
                        className="mr-2 p-2 rounded-xl content-center border-2  border-[#f1a34a]  cursor-pointer hover:bg-[#f1a34a] hover:text-white"
                        onClick={() => handleSelectFAQ(faq.content.toString(), faq.faqId)}>
                        {faq.content}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* 하위 질문들 */}
                  {(() => {
                    const filteredContent = allContent.filter((item) => item.parentId === parentId);

                    if (filteredContent.length === 1) {
                      return (
                        <>
                          {/* 선택된 질문 표시 */}
                          <div className="flex justify-end px-5 py-1">
                            <div className="mr-2 p-2 rounded-xl content-center border-2 border-[#f1a34a] ">
                              {selectFAQ}
                            </div>
                          </div>

                          <div className="flex px-5 py-3">
                            <div className="w-12 h-12 rounded-full min-w-12">
                              <img src={logo} alt="logo" />
                            </div>
                            <div className="content-center p-2 ml-5 bg-gray-200 rounded-xl">
                              {filteredContent[0].content}
                            </div>
                          </div>

                          <div
                            onClick={handleBack}
                            className="text-white bg-[#f1a34a] mx-20 mt-5 p-2 text-center rounded-lg font-bold text-xl cursor-pointer absolute bottom-4 right-[95px]
                            hover:scale-105 hover:transition-transform z-50">
                            처음으로
                          </div>
                        </>
                      );
                    } else {
                      // 하위 질문이 여러 개 일때
                      return [
                        ...filteredContent.map((item) => (
                          <div className="flex justify-end px-5 py-1" key={item.faqId}>
                            <div
                              className="mr-2 p-2 rounded-xl content-center border-2 border-[#f1a34a]  cursor-pointer hover:bg-[#f1a34a] hover:text-white"
                              onClick={() => handleSelectFAQ(item.content.toString(), item.faqId)}>
                              {item.content}
                            </div>
                          </div>
                        )),
                        <div
                          onClick={handleBack}
                          className="text-white bg-[#f1a34a] mx-20 mt-5 p-2 text-center rounded-lg font-bold text-xl cursor-pointer absolute bottom-4 right-[95px]
                          hover:scale-105 hover:transition-transform z-50">
                          처음으로
                        </div>
                      ];
                    }
                  })()}
                </>
              )}
            </div>
          </div>
          {edit && <FAQEdIt Close={() => setEdit(false)} />}
        </>
      )}
    </div>
  );
};

export default FAQ;
