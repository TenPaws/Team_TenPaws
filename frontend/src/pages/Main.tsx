import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Chat from "../components/Chat";
import Main2 from "/main3.png";
import AImatching from "/pet-house (2) 1.svg";
import met from "/pet-food 1.png";
import care from "/animal (1) 1.png";
import { motion, AnimatePresence } from "framer-motion";

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
  description : string
  introduction : string
}

const Main: React.FC = () => {
  const [activeIcon, setActiveIcon] = useState<IconType>("dog");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [pets, setPets] = useState<ProcessedPet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigate();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ["dog", "approve", "board", "check"] as IconType[];
  const [isScrolling, setIsScrolling] = useState(false);
  const adoptionRef = React.useRef<HTMLDivElement>(null);

  // 스크롤
  useEffect(() => {
    const adoptionSection = adoptionRef.current;
    if (!adoptionSection) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 무시
      if (isScrolling) return;

      if (currentSection === 0 && e.deltaY < 0) {
        // 스크롤 허용
        const wheelEvent = new WheelEvent("wheel", {
          deltaY: e.deltaY,
          bubbles: true
        });
        window.dispatchEvent(wheelEvent);
        return;
      }

      // 섹션 전환
      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        setIsScrolling(true);
        setCurrentSection((prev) => prev + 1);
        setActiveIcon(sections[currentSection + 1]);
        setTimeout(() => {
          setIsScrolling(false);
        }, 950);
      } else if (e.deltaY < 0 && currentSection > 0) {
        setIsScrolling(true);
        setCurrentSection((prev) => prev - 1);
        setActiveIcon(sections[currentSection - 1]);
        setTimeout(() => {
          setIsScrolling(false);
        }, 950);
      }
    };

    adoptionSection.addEventListener("wheel", handleWheel, { passive: false });
    return () => adoptionSection.removeEventListener("wheel", handleWheel);
  }, [currentSection, sections, isScrolling]);

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

  const renderAdoptionJourney = () => {
    return (
      <div className="relative w-full py-20 overflow-hidden bg-white">
        <div className="w-[1100px] mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-4xl font-bold">
              <span className="text-[#7F5546]">Ten</span>
              <span className="text-[#f1a34a]">Paws</span> 와 함께하는 입양 여정
            </h2>
            <p className="text-gray-600">새로운 가족을 만나는 과정을 미리 확인해 보세요</p>
          </div>

          <div
            ref={adoptionRef}
            className="flex gap-8 h-[550px] overflow-hidden sticky top-0"
            style={{ scrollBehavior: "smooth" }}>
            {/* 설명 */}
            <div className="relative w-full h-[550px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full h-full">
                  <div className="relative h-full">
                    <div className="relative flex h-full">
                      <div className="relative z-20 w-1/2 pb-16 flex flex-col justify-center">
                        <h3 className="text-4xl font-bold mb-6 text-[#3c2a13]">
                          {descriptions[sections[currentSection]].title}
                        </h3>
                        {descriptions[sections[currentSection]].content.map((line, index) => (
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 * index }}
                            className="mb-4 text-xl leading-relaxed text-gray-600">
                            {line}
                          </motion.p>
                        ))}
                      </div>

                      {/* 이미지 */}
                      <div className="relative w-1/2 ">
                        <motion.img
                          key={`img-${currentSection}`}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          src={`/${iconToImageMap[sections[currentSection]]}`}
                          alt="Section Image"
                          className="absolute top-0 right-0 w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* 인디케이터 */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 pb-10">
          {sections.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                currentSection === index ? "bg-[#f1a34a]" : "bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentSection(index)}
              initial={false}
              animate={{
                scale: currentSection === index ? 1.2 : 1,
                backgroundColor: currentSection === index ? "#f1a34a" : "#D1D5DB"
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Chat />
      
      {/* <section className="relative">
        <div className="relative flex justify-center">
          <div className="relative w-[1150px]">
            <div className="absolute top-0 left-0 z-10 w-full h-full">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white via-white/5 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="absolute z-20 pt-12 pl-8">
                <div className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                  <div className="sm:pb-1 md:pb-2 lg:pb-3 xl:pb-5">기다림의 끝에서</div>
                  <div className="pb-1 sm:pb-2 md:pb-3 lg:pb-5 xl:pb-7">서로를 만나는 순간</div>
                </div>
                <div className="pb-2 text-sm sm:text-xl md:text-2xl lg:text-3xl sm:pb-4 md:pb-6 lg:pb-8 xl:pb-10">
                  TenPaws가 맺어주는 하나뿐인 인연
                </div>
                <div
                  className="text-white bg-[#f1a34a] inline py-2 sm:py-3 px-8 sm:px-16 text-xl sm:text-2xl md:text-3xl rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#3c2a13] hover:duration-300"
                  onClick={() => navigation("/matching")}>
                  시작하기
                </div>
              </div>
              <img src={Main2} alt="main2" className="relative z-0 h-[50vh] w-screen object-cover" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-white/80 via-white/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section> */}


<section className="relative">
  <div className="relative">
    <img src={Main2} alt="main2" className="relative z-0 h-[50vh] w-screen object-cover" />
    <div className="absolute top-0 left-0 z-10 w-full h-full">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-white/5 via-white/10 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 via-white/10 to-transparent"></div>
        </div>
    
    <div className="absolute top-0 left-0 w-full h-full flex justify-center">
      <div className="relative w-[1150px]">
        

        <div className="absolute z-20 pt-12 pl-8">
          <div className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            <div className="sm:pb-1 md:pb-2 lg:pb-3 xl:pb-5">기다림의 끝에서</div>
            <div className="pb-1 sm:pb-2 md:pb-3 lg:pb-5 xl:pb-7">서로를 만나는 순간</div>
          </div>
          <div className="pb-2 text-sm sm:text-xl md:text-2xl lg:text-3xl sm:pb-4 md:pb-6 lg:pb-8 xl:pb-10">
          TenPaws가 맺어주는 하나뿐인 인연
          </div>
          <div
            className="text-white bg-[#f1a34a] inline py-2 sm:py-3 px-8 sm:px-16 text-xl sm:text-2xl md:text-3xl rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#3c2a13] hover:duration-300"
            onClick={() => navigation("/matching")}>
            시작하기
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <div className="relative z-10 h-20 -mt-20 bg-gradient-to-b from-transparent to-white"></div>

      {/* About TenPaws */}
      <section className="relative justify-center px-4 -mt-1 text-center bg-white py-28">
        <div
          className="pb-10 text-4xl font-bold md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl"
          style={{ color: "#7F5546" }}>
          <span className="text-black">About</span> Ten<span className="text-[#f1a34a]">Paws</span>
        </div>

        <div className="flex flex-col items-center justify-center max-w-6xl gap-8 mx-auto md:flex-row">
          {/* AI 매칭 */}
          <div
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-white w-full md:w-1/3 cursor-pointer
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
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-white w-full md:w-1/3 cursor-pointer
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
            className="flex flex-col items-center p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-white w-full md:w-1/3 cursor-pointer
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
      <section className="w-full py-16 bg-gray-50">
        <div className="text-center">
          <h2 className="mb-3 text-4xl font-bold">가족을 기다리고 있어요!</h2>
        </div>
        <div className="w-[1100px] mx-auto">
          <div className="flex flex-col items-center">
            {/* 큰 카드 */}
            <div className="relative w-full mt-16">
              {/* 왼쪽 */}
              <button
                onClick={handlePrevCard}
                className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 z-10
                  w-10 h-10 rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center 
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
              <div className="bg-white rounded-2xl p-8 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <div className="flex gap-8 ">
                  {/* 사진*/}
                  <div className="flex-1">
                    <img
                      src={`http://15.164.103.160:8080${filteredPets[currentPetIndex]?.imageUrls[0]}`}
                      alt="동물 사진"
                      className="object-cover w-full rounded-lg h-96"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 pl-8 border-l border-gray-200 ">
                    <h3 className="mb-6 text-2xl font-bold">{filteredPets[currentPetIndex]?.species}</h3>
                    <div className="space-y-4 text-lg">
                      <p>나이: {filteredPets[currentPetIndex]?.age}</p>
                      <p>크기: {filteredPets[currentPetIndex]?.size}</p>
                      <p>활동량: {filteredPets[currentPetIndex]?.personality}</p>
                      <p>
                        오게된 이유: Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aperiam doloribus
                        molestiae atque ex quam dicta laborum, veniam esse? Soluta molestiae at corrupti aliquid
                        aspernatur omnis illum dicta nemo deleniti libero?
                        {filteredPets[currentPetIndex]?.description}
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
                  w-10 h-10 rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center 
                  hover:bg-gray-50 transition-colors -mx-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* 페이지 */}
              <div className="flex justify-center gap-2 mt-4">
                {filteredPets.slice(0, 5).map((_, idx) => (
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

      {renderAdoptionJourney()}
    </div>
  );
};

export default Main;
