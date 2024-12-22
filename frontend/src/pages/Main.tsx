import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Chat from "../components/Chat";
import Main2 from "/main3.png";
import AImatching from "/pet-house (2) 1.svg";
import met from "/pet-food 1.png";
import care from "/animal (1) 1.png";

type IconType = "dog" | "approve" | "board" | "check";
type Description = {
  title: string;
  content: string[];
};

const iconToImageMap: Record<IconType, string> = {
  dog: "page.png",
  approve: "page2.png",
  board: "page3.png",
  check: "page4.png"
};

const descriptions: Record<IconType, Description> = {
  dog: {
    title: "매칭 동물 결정",
    content: ["필요한 조건을 골라 원하는 반려 동물들을 결정해 보세요."]
  },
  approve: {
    title: "매칭 신청",
    content: ["매칭 신청 시 보호소 사이트로 이동하게 되며 보호소 양식에 따라 입양 신청서 작성이 필요합니다."]
  },
  board: {
    title: "보호소 확인 및 승인",
    content: ["보호소에서 입양 신청서를 확인하고 승인 및 거부 결정을 합니다."]
  },
  check: {
    title: "승인 완료",
    content: ["보호소에서 승인 완료 및 거절 시 알림과 내정보에서 확인이 가능합니다."]
  }
};

interface ProcessedPet {
  petId: number;
  species: string;
  age: string;
  personality: string;
  exerciseLevel: number;
  size: string;
  status: string;
  imageUrls: string[];
}

const Main: React.FC = () => {
  const [activeIcon, setActiveIcon] = useState<IconType>("dog");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [pets, setPets] = useState<ProcessedPet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigate();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);

  // 동물 매칭 호출
  useEffect(() => {
    const fetchPetList = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://15.164.103.160:8080/api/v1/pets");
        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("동물 리스트를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPetList();
  }, []);

  // 필터링 로직
  const filteredPets = Array.isArray(pets)
    ? pets.filter((pet) => {
        if (activeCategory === "전체") return pet.status === "AVAILABLE";
        return pet.status === "AVAILABLE" && pet.species === activeCategory;
      })
    : [];

  // 상세 페이지 이동
  const goToDetail = (petId: number) => {
    navigation(`/detail/${petId}`);
  };

  // 이전
  const handlePrevCard = () => {
    setCurrentPetIndex((prev) => (prev === 0 ? filteredPets.length - 1 : prev - 1));
  };

  //다음
  const handleNextCard = () => {
    setCurrentPetIndex((prev) => (prev === filteredPets.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Chat />

      {/* 메인 배너 */}
      <section className="relative">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-full z-10">
            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-white via-white/95 to-transparent"></div>
          </div>

          <div className="relative xl:pl-[500px]">
            <div className="absolute pt-12 pl-8 sm:pt-16 md:pt-20 lg:pt-24 sm:pl-16 md:pl-24 lg:pl-32 z-20">
              <div className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                <div className="sm:pb-5 md:pb-8 lg:pb-8 xl:pb-15">기다림의 끝에서</div>
                <div className="pb-1 sm:pb-7 md:pb-9 lg:pb-12 xl:pb-15">서로를 만나는 순간</div>
              </div>
              <div className="pb-5 text-sm sm:text-xl md:text-2xl lg:text-3xl sm:pb-12 md:pb-14 lg:pb-17 xl:pb-20">
                TenPaws가 맺어주는 하나뿐인 인연
              </div>
              <div
                className="font-bold text-white bg-[#f1a34a] inline py-2 sm:py-3 px-8 sm:px-16 text-xl sm:text-2xl md:text-3xl rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#3c2a13] hover:duration-300"
                onClick={() => navigation("/matching")}>
                시작하기
              </div>
            </div>
            <img src={Main2} alt="main2" className="relative z-0 h-[50vh] w-full object-cover" />
          </div>
        </div>
      </section>

      <div
        className="h-20 bg-gradient-to-b from-transparent to-white relative 
      -mt-20 z-10"></div>

      {/* About TenPaws */}
      <section className="relative bg-white -mt-1 py-28 px-4 justify-center text-center">
        <div
          className="text-4xl font-bold md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl pb-10"
          style={{ color: "#7F5546" }}>
          <span className="text-black">About</span> Ten<span className="text-[#f1a34a]">Paws</span>
        </div>

        <div className="flex flex-col items-center justify-center max-w-6xl gap-8 mx-auto md:flex-row">
          {/* AI 매칭 */}
          <div
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-white w-full md:w-1/3 cursor-pointer
          hover:scale-105 transition-transform duration-300">
            <div className="bg-[#f1a34a] mb-4 p-2 pb-3 rounded-full">
              <img src={AImatching} alt="AI 매칭" className="w-10 h-10 " />
            </div>
            <h3 className="mb-2 text-xl font-bold">AI 매칭</h3>
            <p className="text-center">
              AI가 당신의 생활패턴과 선호도를 분석하여 가장 잘 맞는 반려동물을 추천해드립니다
            </p>
          </div>

          {/* 신중한 입양 */}
          <div
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-white w-full md:w-1/3 cursor-pointer
          hover:scale-105 transition-transform duration-300">
            <div className="bg-[#f1a34a] mb-4 p-2 pb-3 rounded-full">
              <img src={met} alt="신중한 입양" className="w-10 h-10 " />
            </div>
            <h3 className="mb-2 text-xl font-bold">신중한 입양</h3>
            <p className="text-center ">
              보호소와 협력하여
              <br /> 책임감 있는 입양 절차를 도와드립니다
            </p>
          </div>

          {/* 편의 케어 */}
          <div
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-white w-full md:w-1/3 cursor-pointer
          hover:scale-105 transition-transform duration-300">
            <div className="bg-[#f1a34a] mb-[21px] p-2 rounded-full">
              <img src={care} alt="편의 케어" className="w-10 h-10 " />
            </div>
            <h3 className="mb-2 text-xl font-bold">편의 케어</h3>
            <p className="text-center ">
              주변 시설 정보 부터 산책로 까지
              <br /> 반려동물 케어에 필요한정보를 제공합니다
            </p>
          </div>
        </div>
      </section>

      {/* 동물 카드 */}
      <section className="w-full bg-gray-50 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3">가족을 기다리고 있어요!</h2>
        </div>
        <div className="w-[1100px] mx-auto">
          <div className="flex flex-col items-center">

            {/* 큰 카드 */}
            <div className="w-full mt-16 relative">
              {/* 왼쪽 */}
              <button
                onClick={handlePrevCard}
                className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 z-10
                  w-10 h-10 rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center 
                  hover:bg-gray-50 transition-colors -mx-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 19l-7-7 7-7"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* 카드 */}
              <div className="bg-white rounded-2xl p-8 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="flex gap-8 ">
                  {/* 사진*/}
                  <div className="flex-1">
                    <img
                      src={`http://15.164.103.160:8080${filteredPets[currentPetIndex]?.imageUrls[0]}`}
                      alt="동물 사진"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 border-l border-gray-200 pl-8 ">
                    <h3 className="text-2xl font-bold mb-6">{filteredPets[currentPetIndex]?.species}</h3>
                    <div className="space-y-4 text-lg">
                      <p>나이: {filteredPets[currentPetIndex]?.age}</p>
                      <p>크기: {filteredPets[currentPetIndex]?.size}</p>
                      <p>활동량: {filteredPets[currentPetIndex]?.personality}</p>
                      <p>
                        오게된 이유: Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aperiam doloribus
                        molestiae atque ex quam dicta laborum, veniam esse? Soluta molestiae at corrupti aliquid
                        aspernatur omnis illum dicta nemo deleniti libero?
                      </p>
                    </div>
                    <div className="flex justify-center mt-5">
                      <button
                        className="px-4 py-1 text-sm text-[#f1a34a] border border-[#f1a34a] rounded-full hover:bg-[#f1a34a] hover:text-white transition-colors"
                        onClick={() => goToDetail(filteredPets[currentPetIndex]?.petId)}>
                        자세히 보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽 */}
              <button
                onClick={handleNextCard}
                className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 z-10
                  w-10 h-10 rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center 
                  hover:bg-gray-50 transition-colors -mx-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* 페이지 */}
              <div className="flex justify-center mt-4 gap-2">
                {filteredPets.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentPetIndex ? "bg-[#f1a34a]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 입양 여정 */}
      <div className="w-full flex flex-col items-center bg-white py-20">
        <div className="w-[1100px] relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">
              <span className="text-[#7F5546]">Ten</span>
              <span className="text-[#f1a34a]">Paws</span> 와 함께하는 입양 여정
            </h2>
            <p className="text-gray-600">새로운 가족을 만나는 과정을 미리 확인해 보세요</p>
          </div>

          <div className="flex gap-8 h-[850px] ">
            {/* 진행 단계 */}
            <div className="bg-[#f1a34a] rounded-2xl p-2 shadow-lg w-[220px] h-full">
              <div className="flex flex-col justify-center h-full space-y-10">
                {(["dog", "approve", "board", "check"] as IconType[]).map((icon, idx, arr) => (
                  <React.Fragment key={icon}>
                    <div
                      className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        activeIcon === icon ? "scale-105" : "hover:scale-105"
                      }`}
                      onClick={() => setActiveIcon(icon)}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3
                        transition-all duration-300 shadow-md
                        ${
                          activeIcon === icon
                            ? "bg-[#f1a34a] ring-2 ring-white"
                            : "bg-white hover:bg-[#f1a34a] hover:ring-2 hover:ring-white"
                        }`}>
                        <img
                          src={`/${icon}.png`}
                          alt={descriptions[icon].title}
                          className={`w-6 h-6 transition-all duration-300 ${
                            activeIcon === icon ? "brightness-0 invert" : "hover:brightness-0 hover:invert"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-base font-bold text-center  transition-all duration-300 ${
                          activeIcon === icon ? "opacity-100" : "opacity-70 hover:opacity-100"
                        }`}>
                        {descriptions[icon].title}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex justify-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white opacity-70">
                          <path
                            d="M12 4L12 16M12 16L7 11M12 16L17 11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 설명 */}
            <div className="flex-1 bg-white rounded-2xl p-10 shadow-lg border border-gray-100 h-full">
              <div className="max-w-3xl h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6 text-[#3c2a13]">{descriptions[activeIcon].title}</h3>
                {descriptions[activeIcon].content.map((line, index) => (
                  <p key={index} className="text-gray-600 mb-4 leading-relaxed">
                    {line}
                  </p>
                ))}
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={`/${iconToImageMap[activeIcon]}`}
                    alt="Matching Animal Example"
                    className="w-full max-w-2xl rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
