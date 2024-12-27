import React, { useState, useEffect } from 'react';
import axiosInstance from "../../utils/axiosInstance"; 
import { Link, useNavigate } from 'react-router-dom';
import { GoArrowRight } from "react-icons/go";
import MyPageModal from '../../components/MyPageModal';
import Header from '../../components/Header';
import axios from 'axios';


// 유저 정보 타입 정의
interface UserInfo {
  id: string;
  email: string;
  username: string;
  birthDate: string;
  phoneNumber: string;
  address: string;
  preferredSize: string;
  preferredPersonality: string;
  preferredExerciseLevel: string;
  userRole: string;
  password: string;
}

interface PetInfo {
  id: number;
  pet: {
    petId: number;
    petName: string;
    species: string;
    size: string;
    age: string;
    personality: string;
    exerciseLevel: string;
    imageUrls: string[];
  };
  userId: number;
  applyDate: string;
  applyStatus: string;
}

interface UseId {
  Id: number;
}

interface SocialInfo {
  userId : string;
  email: string;
  type: string;
  role: string;
}


const MyPageUser: React.FC = () => {
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setApplyModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'mypage' | 'adoption'>('mypage');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null); // 선택된 pet.id 상태 추가
  const [token, setToken] = useState<string | null>(null);
  const [social, setSocial] = useState<SocialInfo | null>({
    userId: "",
    email: "",
    type: "",
    role: ""
  })
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>({
    id: "",
    password: "",
    email: "",
    username: "",
    birthDate: "",
    phoneNumber: "",
    address: "",
    preferredSize: "",
    preferredPersonality: "",
    preferredExerciseLevel: "",
    userRole: ""
  });

  const [petInfo, setPetInfo] = useState<PetInfo[] | null>([]);

  const [passwordError, setPasswordError] = useState<string | null>(null); // 비밀번호 오류 메시지 상태
  const [useId, setUseId] = useState<UseId>({
    Id: 0
  })
  
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

  console.log(token)



  // ID 불러오기
  useEffect(() => {
    if(token) {
      const userId = async () => {
        try {
          const response = await axiosInstance.get(`/api/v1/features/user-id`, {headers});
          setUseId(response.data);
        } catch(error: any) {
          console.error("유저 ID를 불러오는 중 오류 발생:", error);
          // handleError(error);
        }
      };
      userId();
    }
  }, [token])

  // 유저, 펫 정보 가져오기
  useEffect(() => {
    if(useId.Id !== 0){
      const userInfo = async () => {
        try {
          const response = await axiosInstance.get<UserInfo>(`/api/v1/users/${useId.Id}`, {headers});
          setUserInfo(response.data);
        } catch (error: any) {
          console.error('유저 정보를 불러오는 중 오류 발생:', error);
          // handleError(error);
        }
      };

      const petInfos = async () => {
        if(petInfo) {
          try {
            const response = await axiosInstance.get<PetInfo[]>(`/api/v1/applypet/${useId.Id}/list`, {headers});
            if (response.data && response.data.length > 0) {
              setPetInfo(response.data);
            }else {
              setPetInfo(null);
            }
          }catch(error: any) {
            console.error('입양신청 정보를 불러오는 중 오류 발생:', error);
            // handleError(error);
          }
        }
      };

      userInfo();
      petInfos();
    }
  }, [useId.Id]);

  //소셜 불러오기
  useEffect(() => {
    if(social) {
      const socials = async () => {
        try {
          const response = await axiosInstance.get<SocialInfo>(`/api/v1/users/my-info`, {headers});
          if (response.data) {
            setSocial(response.data);
            console.log(response.data)
          }else{
            setSocial(null);
          }
        }catch(error) {
          console.error('소셜 정보를 불러오는 중 오류 발생:', error);
        }
      }
      socials()
    }
  }, [token])



  const deleteApply = async (): Promise<void> => {
    try {
      await axios.post(
        `http://3.38.196.10:8080/api/v1/applypet/${selectedPetId}/cancel`,
        null,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          params: {
            userId:useId.Id
          }
        }
      );
      alert("입양 취소가 완료되었습니다.");
      setApplyModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("입양 취소 중 오류가 발생했습니다", error);
      alert("입양 취소를 다시 시도해 주세요");
      setApplyModalOpen(false);
    }
  };


  // 비밀번호 유효성 검증 함수
  const validatePassword = (password: string): string | null => {
    if (password.length < 8 || password.length > 12) {
      return '비밀번호는 8자 이상 12자 이하로 설정해야 합니다.';
    }
    if (!/[A-Z]/.test(password)) {
      return '비밀번호에 최소 1개의 대문자가 포함되어야 합니다.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return '비밀번호에 최소 1개의 특수문자가 포함되어야 합니다.';
    }
    return null;
  };
  

  // 입력값 변경 처리
  const editChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
  
    if (userInfo) { // 먼저 userInfo가 null이 아닌지 확인
      setUserInfo((prev) =>
        prev ? { ...prev, [name]: value } : prev
      );
  
      if (name === 'password') {
        const error = validatePassword(value);
        setPasswordError(error);
      }
    }
  };
  

  // 정보 수정 제출

  const editSubmit = async (): Promise<void> => {
    if (!userInfo) return;

    // 비밀번호 검증
    if (passwordError) { // passwordError 상태로 검증
      alert(passwordError);
      return;
    }
    try {
      await axiosInstance.put(`/api/v1/users/${useId.Id}`, userInfo , {headers});
      alert('정보가 수정되었습니다.');
      setEditModalOpen(false);
    } catch (error) {
      console.error('정보 수정 중 오류 발생:', error);
      alert('정보 수정에 실패했습니다.');
    }
  };

  // 회원 탈퇴 처리
  const DeleteAccount = async (): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/v1/users/${useId.Id}`, {headers});
      alert('회원탈퇴가 완료되었습니다.');
      setDeleteModalOpen(false);
      navigate("/");
    } catch (error) {
      console.error('회원탈퇴 중 오류 발생:', error);
      alert('회원탈퇴에 실패했습니다.');
    }
  };

  // 소셜 탈퇴 처리
  const deleteSocial = async () => {
    if(social) {
      try {
        await axiosInstance.delete<SocialInfo>(`/api/v1/users/social/${social.userId}`, {headers});
        alert('회원탈퇴가 완료되었습니다.');
        setDeleteModalOpen(false);
        navigate("/");
      }catch(error) {
        console.error('회원탈퇴 중 오류 발생:', error);
        alert('회원탈퇴에 실패했습니다.');
      }
    }
  }

  const renderContent = () => {
    if (activeTab === 'mypage') {
      return (
        <div className="flex flex-col items-center max-[590px]:mx-10">
          {/* 마이페이지 내용 */}
          {
            <section className="flex flex-col w-full max-w-lg gap-2 mb-10 ">
              <div>
                <h3 className='text-3xl font-bold text-mainColor'>마이페이지</h3>
              </div>
              {social?.type == "naver" || social?.type == "kakao" ? (
                <div className='flex flex-wrap justify-center gap-8 p-5 bg-bgColor rounded-2xl'>
                  <div className="">
                    <p className="mb-2 text-xl font-bold ">메일</p>
                    <p className='text-lg'>{social.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap p-5">
                  <p className="mb-2 text-xl font-bold">이름</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <p className='text-lg'>{userInfo?.username}</p>
                  </div>
                  <p className="mb-2 text-xl font-bold">주소</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <p className='text-lg'>{userInfo?.address}</p>
                  </div>
                  <p className="mb-2 text-xl font-bold">메일(아이디)</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <p className='text-lg'>{userInfo?.email}</p>
                  </div>
                  <p className="mb-2 text-xl font-bold">생년월일</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <p className='text-lg'>{userInfo?.birthDate}</p>
                  </div>
                  <p className="mb-2 text-xl font-bold">전화번호</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <p className='text-lg'>{userInfo?.phoneNumber}</p>
                  </div>
                  <p className="mb-2 text-xl font-bold">선호동물</p>
                  <div className="flex justify-between w-full p-3 mb-5 border-b border-mainColor">
                    <span className='text-lg'>{userInfo?.preferredSize}</span>/
                    <span className='text-lg'>{userInfo?.preferredPersonality}</span>/
                    <span className='text-lg'>{userInfo?.preferredExerciseLevel}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  className="text-lg text-mainColor hover:text-orange-500"
                  onClick={() => setEditModalOpen(true)}
                >
                  정보수정
                </button>

              </div>
            </section>
          }
        </div>
      );
    } else if (activeTab === 'adoption') {
      return (
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold text-mainColor">입양 신청 동물</h3>
          {/* 입양 신청 리스트 내용 */}
          {
            <section className='mt-10'>
              {Array.isArray(petInfo) && petInfo.filter(pet => pet.applyStatus === "PENDING" || pet.applyStatus === "COMPLETED").length > 0 ? (
                petInfo
                  .filter(pet => pet.applyStatus === "PENDING" || pet.applyStatus === "COMPLETED") // applyStatus가 "PENDING"인 것만 필터링
                  .map((pet) => (
                    <section
                      key={pet.id} // 키를 각 pet의 id로 설정
                      className="relative flex flex-col items-center w-full max-w-lg my-10 overflow-hidden border rounded-lg"
                    >
                      <div>
                        {/* 카드 */}
                        <div className="bg-white rounded-2xl p-8 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center justify-center gap-8 ">
                            {/* 사진*/}
                            <div className="flex flex-col items-center justify-center font-bold">
                              <img
                                src={`http://3.38.196.10:8080${pet.pet.imageUrls[0]}`}
                                alt="동물 사진"
                                className="object-cover w-full h-48 rounded-lg"
                              />
                              <p>{pet.pet.petName}</p>
                            </div>
                            {/* 정보 */}
                            <div className="flex-1 pl-8 mt-2 border-l border-gray-200">
                              <div className="space-y-4 text-lg">
                                <p className='px-3 border rounded-xl border-mainColor'>#나이: {pet.pet.age}</p>
                                <p className='px-3 border rounded-xl border-mainColor'>#크기: {pet.pet.size}</p>
                                <p className='px-3 border rounded-xl border-mainColor'>#성격: {pet.pet.personality}</p>
                                <p className='px-3 border rounded-xl border-mainColor'>#활동량: {pet.pet.exerciseLevel}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center my-3">
                            {pet.applyStatus == "PENDING" ? 
                              <button
                                className="text-cancelColor"
                                onClick={() => {
                                  setSelectedPetId(pet.id); 
                                  setApplyModalOpen(true); }} 
                              >
                                입양 신청 취소
                              </button> :
                              <p className='mb-2 text-xl font-bold'>입양 승인 완료</p>
                            }
                          </div>
                        </div>
                      </div>

                      {/* 입양 취소 모달 */}
                      <MyPageModal isOpen={isApplyModalOpen} onClose={() => setApplyModalOpen(false)}>
                        <h3 className="mb-4 text-lg font-bold">입양 취소 하시겠습니까?</h3>
                        <div className="flex justify-end gap-4 mt-6">
                          <button className="text-mainColor" onClick={deleteApply}>
                            네
                          </button>
                          <button className="text-cancelColor" onClick={() => setApplyModalOpen(false)}>
                            아니오
                          </button>
                        </div>
                      </MyPageModal>
                    </section>
                  ))
                ) : (
                  <p className="mb-20">입양신청 동물이 없습니다.</p>
                )
              }
            </section>

          }
        </div>
      );
    }
  };




  if (!userInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <Header />
      <div className="flex justify-center gap-40 pb-2 my-10">
        <button
          className={`text-mainColor font-bold ${activeTab === 'mypage' ? 'border-b-2 border-mainColor' : ''}`}
          onClick={() => setActiveTab('mypage')}
        >
          마이페이지
        </button>
        <button
          className={`text-mainColor font-bold ${activeTab === 'adoption' ? 'border-b-2 border-mainColor' : ''}`}
          onClick={() => setActiveTab('adoption')}
        >
          입양 신청 동물
        </button>
      </div>

      {renderContent()}

      {/* 수정 모달 */}
      <MyPageModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <h3 className="mb-4 text-lg font-bold">정보 수정</h3>
        <div className="flex flex-col gap-4">
          <label>
            이름
            <input
              type="text"
              name="username"
              value={userInfo?.username || ''} // userInfo가 null이면 빈 문자열 사용
              onChange={editChange}
              className="block w-full p-2 border rounded"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={userInfo.password}
              onChange={editChange}
              className="block w-full p-2 border rounded"
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </label>
          <label>
            전화번호
            <input
              type="text"
              name="phoneNumber"
              value={userInfo.phoneNumber}
              onChange={editChange}
              className="block w-full p-2 border rounded"
            />
          </label>
          <label>
            주소
            <input
              type="text"
              name="address"
              value={userInfo.address}
              onChange={editChange}
              className="block w-full p-2 border rounded"
            />
          </label>
          <label>
            선호동물
            <Link to='/prefer'>
              <button className="flex items-center w-full p-2 border rounded">
                {userInfo.preferredSize} / {userInfo.preferredPersonality} / {userInfo.preferredExerciseLevel}
                등록<GoArrowRight />
              </button>
            </Link>
          </label>
        </div>
        <div className='flex justify-end mt-2'>
          <button
            className="text-xs text-gray-600 underline hover:text-red-700"
            onClick={() => setDeleteModalOpen(true)}
          >
            회원탈퇴
          </button>
        </div>
        <div className="flex gap-4 mt-6 justify-evenly">
          <button className="text-mainColor" onClick={editSubmit}>
            수정완료
          </button>
          <button className="text-cancelColor" onClick={() => setEditModalOpen(false)}>
            취소
          </button>
        </div>
      </MyPageModal>
      {/* 회원탈퇴 모달 */}
      <MyPageModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <h3 className="mb-4 text-lg font-bold">정말로 탈퇴하시겠습니까?</h3>
        <div className="flex justify-end gap-4 mt-6">
          {social?.type == "naver" || social?.type == "kakao" ? (
          <button className="text-mainColor" onClick={deleteSocial}>
          네
        </button>)
        :
        (<button className="text-mainColor" onClick={DeleteAccount}>
            네
          </button>
        )}
          <button className="text-cancelColor" onClick={() => setDeleteModalOpen(false)}>
            아니오
          </button>
        </div>
      </MyPageModal>
    </div>
  );
};

export default MyPageUser;

