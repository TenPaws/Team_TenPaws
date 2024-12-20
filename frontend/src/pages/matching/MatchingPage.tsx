import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { GoArrowRight } from "react-icons/go";
import axiosInstance from "../../utils/axiosInstance";

interface ProcessedPet {
  petId: number;
  species: string;
  age: string;
  personality: string;
  exerciseLevel: string;
  size: string;
  status: string;
  imageUrls: string[];
}

interface UseRole {
  role: string;
}

const MatchingPage = () => {
  const [pets, setPets] = useState<ProcessedPet[]>([]); // 동물 데이터 저장 상태
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [useRole, setUseRole] = useState<UseRole>({role: ""});
  const [filters, setFilters] = useState({
    species: "",
    age: "",
    size: ""
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("로컬 스토리지에 토큰이 없습니다.");
    }
  }, []);


  const headers = {
    'Authorization': `${token}`,
  };

  useEffect(() => {
    const fetchPetList = async () => {
      setLoading(true); // 로딩 상태 시작
      try {
        const response = await axiosInstance.get('/api/v1/pets'); // API 호출
        setPets(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("동물 리스트를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };
    fetchPetList();
  }, [token])

  useEffect(() => {
    if(token) {
      const userRole = async () => {
        try {
          const response = await axiosInstance.get(`/api/v1/features/role`, {headers}); // 현재 로그인 유저 role 확인 API 호출
          setUseRole(response.data)
        } catch (error) {
          console.error("유저 role 불러오는 중 오류 발생:", error);
        }
      };
      userRole(); // 데이터 가져오기 함수 실행
    }
  }, [token]); 

  const shelter = useRole.role == "ROLE_SHELTER"
  // const shelter = true // 임시 테스트용

  // 필터 변경 시 호출되는 핸들러
  const filterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [id]: value
    }));
  };

  // 필터링된 동물 리스트 반환
  const filteredPets = Array.isArray(pets) ? pets.filter((pet) => {
    return (
      (pet.status === "AVAILABLE") &&
      (!filters.species || pet.species === filters.species) &&
      (!filters.age || pet.age === filters.age) &&
      (!filters.size || pet.size === filters.size)
    );
  }) : [];
  
  // 상세 페이지로 이동하는 링크 생성 함수
  const detailLink = (petId:number) => {
    return `/detail/${petId}`; // 상세 페이지 URL 생성
  };



  if (loading) {
    return <div>로딩 중...</div>; // 로딩 상태 표시
  }
      

  
  return (
    <>
      <Header />
      <div className='flex flex-col max-w-screen'>
        <div className='flex flex-col mt-20 mx-36 max-[630px]:mx-28 max-[530px]:mx-20 max-[466px]:mx-10'>
          <div className='mb-3'>
              <Link to="/detailadd">
                {shelter ? <button className='flex items-center justify-center text-2xl text-mainColor hover:text-orange-600'>동물 등록 <GoArrowRight /></button> : null}
              </Link>
            </div>
          <h1 className='max-[490px]:text-2xl max-[430px]:text-xl text-4xl font-bold text-mainColor'>매칭 동물 결정</h1>
          <p className='max-[635px]:text-sm max-[445px]:text-xs pt-5 '>필요한 조건을 골라 원하는 반려동물들을 결정해 보세요.</p>
        </div>
        <section className='flex flex-wrap mt-10 mx-36 max-[630px]:mx-28 max-[530px]:mx-20 max-[466px]:mx-10'>
          <form className="flex flex-wrap gap-2">
            <select id="species" className="py-2 text-2xl border max-[1333px]:pr-48 rounded-md max-[1140px]:pr-28 pr-64 max-[910px]:text-lg max-[375px]:text-sm" onChange={filterChange}>
              <option value="">종류</option>
              <option value="강아지">강아지</option>
              <option value="고양이">고양이</option>
            </select>
            <div>
            </div>
            <select id="age" className="py-2 text-2xl border max-[1333px]:pr-48 rounded-md max-[1140px]:pr-28 pr-64 max-[910px]:text-lg max-[375px]:text-sm" onChange={filterChange}>
              <option value="">연령</option>
              <option value="0~3살">0~3살</option>
              <option value="4~6살">4~6살</option>
              <option value="7~8살">7~10살</option>
            </select>
            <div>
            </div>
            <select id="size" className="py-2 pr-64 text-2xl border max-[1333px]:pr-48 max-[1140px]:pr-28 rounded-md max-[910px]:text-lg max-[375px]:text-sm" onChange={filterChange}>
              <option value="">크기</option>
              <option value="소형">소형</option>
              <option value="중형">중형</option>
              <option value="대형">대형</option>
            </select>
          </form>     
        </section>
        <section className='mt-5'>
          <div className='flex flex-col items-center justify-center'>
            <h3 className='mb-2 text-2xl font-bold'>매칭이 어려우신가요?</h3>
            <Link to="/ai-matching">
              <button className='flex items-center justify-center p-2 border text-md rounded-2xl text-mainColor border-mainColor hover:text-orange-600'>AI매칭 바로가기 <GoArrowRight /></button>
            </Link>
          </div>
        </section>
        <section className='flex items-center justify-center m-20'>
          <div className='flex flex-col justify-center gap-10'>
            {filteredPets.map((pet) => (
              <Link to={detailLink(pet.petId)}>
                <div key={pet.petId} className='flex border border-solid rounded-lg'>
                  <img src={`http://15.164.103.160:8080${pet.imageUrls[0]}`} alt="동물 사진" className='max-w-60 rounded-l-md'/>
                  <div className='m-3'>
                    <div className='flex justify-center'>
                      <p className='mt-2 text-xl font-bold'>{pet.species}</p>
                    </div>
                    <div className='flex justify-between px-5'>
                      <p className='text-neutral-500'>연령</p><p className='text-black'>{pet.age}</p>
                    </div>
                    <div className='flex justify-between px-5'>
                      <p className='text-neutral-500'>크기</p><p className='text-black'>{pet.size}</p>
                    </div>
                    <div className='flex justify-between px-5'>
                      <p className='text-neutral-500'>성격</p><p className='text-black'>{pet.personality}</p>
                    </div>
                    <div className='flex justify-between px-5'>
                      <p className='text-neutral-500'>활동량</p><p className='text-black'>{pet.exerciseLevel}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default MatchingPage;