import { useEffect, useRef, useState } from "react";
import logo from "/logo.png";
import axios from "axios";
import useStore from "../store/store";
import FAQ from "./FAQ";
import Chatnotlogin from "./Chatnotlogin";

interface userChatRoom {
  chatRoomId: number;
  unReadCount: number;
  oppositeEmail: string;
  oppositeName: string;
  userEmail: string;
  lastMessage?: string;
}

interface chatUser {
  username: string;
  email: string;
}

interface chatMessage {
  message: string;
  chatDate: string;
  senderEmail: string;
  senderName: string;
  unRead: number;
}

const Chat = () => {
  const isLoggedIn = localStorage.getItem("accessToken");
  if (!isLoggedIn) {
    return <Chatnotlogin />;
  }
  const [isopen, setIsOpen] = useState(false);
  const [makeChatRoom, setMakeChatRoom] = useState(false);
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const [oppositeEmail, setOppositeEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userChatRoom, setUserChatRoom] = useState<userChatRoom[]>([]);
  const [chatUser, setChatUser] = useState<chatUser[]>([]);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState<chatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [chatopen, setChatopen] = useState(false);
  const [fnqopen, setFnqopen] = useState(false);
  const {
    connectWebSocket = () => {},
    stompClient = null,
    isConnected = false,
    fetchChatroom = async () => {},
    setFetchChatroom = () => {}
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = chatUser.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const location = window.location.pathname;
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isConnected) {
      connectWebSocket();
    }
    fetchChatroom();
  }, [isConnected, connectWebSocket, fetchChatroom]);

  const handlemakechatroom = () => {
    setMakeChatRoom(true);
    setChatopen(false);
    setChatRoomOpen(false);
    setFnqopen(false);
  };

  const handlechatopen = () => {
    setChatopen(true);
    setMakeChatRoom(false);
    setFnqopen(false);
    if (chatRoomOpen) {
      handleCloseChatRoom();
    }
  };

  const handlefnqopen = () => {
    setFnqopen(true);
    setMakeChatRoom(false);
    setChatopen(false);
    setChatRoomOpen(false);
  };

  const handlechatroomopen = async (RoomId: number) => {
    if (chatRoomOpen && chatRoomId === RoomId) {
      handleCloseChatRoom();
      return;
    }

    try {
      console.log("채팅방 열기 - 룸ID:", RoomId);
      setChatRoomOpen(true);
      setMakeChatRoom(false);
      setChatRoomId(RoomId);

      // 이전 메시지 조회
      const messageResponse = await axios.get(`http://3.38.196.10:8080/api/v1/chatmessages/${RoomId}`, {
        headers: {
          Authorization: localStorage.getItem("accessToken")
        }
      });
      setChatMessage(messageResponse.data);

      await initializeUnRead(RoomId);
      await fetchChatroom();
    } catch (error) {
      console.error("채팅방 열기 실패", error);
    }
  };

  // 채팅방 닫을 때 구독 해제
  const handleCloseChatRoom = () => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      setCurrentSubscription(null);
      setSubscribed(false);
    }
    setChatRoomOpen(false);
    setChatRoomId(null);
    setChatMessage([]);
    fetchChatroom();
  };

  // 현재 사용자의 이메일 추출
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email = payload.email;
      setUserEmail(email);
    }
  }, [userEmail]);

  // fetchChatroom 함수 전역
  useEffect(() => {
    setFetchChatroom(async () => {
      try {
        const response = await axios.get("http://3.38.196.10:8080/api/v1/chatrooms/user", {
          headers: {
            Authorization: localStorage.getItem("accessToken")
          }
        });

        // 각 채팅방의 마지막 메시지 가져오기
        const roomsWithLastMessage = await Promise.all(
          response.data.map(async (room: userChatRoom) => {
            try {
              const messageResponse = await axios.get(
                `http://15.164.103.160:8080/api/v1/chatmessages/${room.chatRoomId}`,
                {
                  headers: {
                    Authorization: localStorage.getItem("accessToken")
                  }
                }
              );
              const messages = messageResponse.data;
              return {
                ...room,
                lastMessage: messages.length > 0 ? messages[messages.length - 1].message : ""
              };
            } catch (error) {
              console.error("메시지 조회 실패", error);
              return room;
            }
          })
        );

        setUserChatRoom(roomsWithLastMessage);
      } catch (error) {
        console.error("목록 조회 실패", error);
        throw error;
      }
    });
  }, [setFetchChatroom]);

  //채팅방 생성
  const handleCreateChat = async () => {
    try {
      const response = await axios.post(
        "http://3.38.196.10:8080/api/v1/chatrooms",
        {
          userEmail,
          oppositeEmail
        },
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
            "Content-Type": "application/json"
          }
        }
      );

      alert("채팅방이 생성 되었습니다.");
      await fetchChatroom();

      if (response.data && response.data.chatRoomId) {
        // 채팅방을 생성하고 바로 구독
        if (stompClient?.connected) {
          const subscription = stompClient.subscribe(`/topic/chatroom/${response.data.chatRoomId}`, async (message) => {
            console.log("채팅방 메시지 수신:", message.body);
            const receivedMessage = JSON.parse(message.body);
            setChatMessage((prev) => [...prev, receivedMessage]);

            await initializeUnRead(response.data.chatRoomId);
            await fetchChatroom();
          });
          setCurrentSubscription(subscription);
          setSubscribed(true);
        }

        await handlechatroomopen(response.data.chatRoomId);
      }

      setMakeChatRoom(false);
    } catch (error) {
      console.error("채팅방 생성 실패", error);
      alert("채팅방 생성에 실패하였습니다.");
    }
  };

  //참여중인 채팅방 목록 조회
  useEffect(() => {
    const fetchChatroom = async () => {
      try {
        const response = await axios.get("http://3.38.196.10:8080/api/v1/chatrooms/user", {
          headers: {
            Authorization: localStorage.getItem("accessToken")
          }
        });
        setUserChatRoom(response.data);
      } catch (error) {
        console.error("목록 조회 실패", error);
      }
    };

    if (userEmail) {
      fetchChatroom();
    }
  }, []);

  //채팅방 삭제
  const handleChatDelete = async () => {
    console.log(chatRoomId);
    try {
      await axios.delete(`http://3.38.196.10:8080/api/v1/chatrooms/${chatRoomId}`, {
        headers: {
          Authorization: localStorage.getItem("accessToken")
        }
      });
      alert("채팅방을 삭제 하였습니다.");
      await fetchChatroom();
      setChatRoomOpen(false);
    } catch (error) {
      console.error("채팅방 삭제 실패", error);
    }
  };

  const messageEndRef = useRef<HTMLDivElement>(null);

  // 스크롤
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 새 메시지가 추가될 때마다 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [chatMessage]);

  const sendMessage = async () => {
    if (!message.trim() || !stompClient?.connected || !chatRoomId) return;

    try {
      stompClient.publish({
        destination: `/app/chat/send/${chatRoomId}`,
        body: JSON.stringify({
          message: message,
          senderEmail: userEmail,
          receiverEmail: oppositeEmail
        })
      });

      await fetchChatroom();
      setMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  //회원 목록 조회
  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        const response = await axios.get("http://3.38.196.10:8080/api/v1/users/chat-users", {
          headers: {
            Authorization: localStorage.getItem("accessToken")
          }
        });
        setChatUser(response.data);
      } catch (error) {
        console.error("회원 목록 조회에 실패하였습니다.", error);
      }
    };
    fetchChatUser();
  }, []);

  useEffect(() => {
    if (chatRoomId && stompClient?.connected && !subscribed) {
      console.log("채팅방 구독 시작:", chatRoomId);

      if (currentSubscription) {
        currentSubscription.unsubscribe();
        setSubscribed(false);
      }

      const subscription = stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, async (message) => {
        console.log("채팅방 메시지 수신:", message.body);
        const receivedMessage = JSON.parse(message.body);
        setChatMessage((prev) => [...prev, receivedMessage]);

        await initializeUnRead(chatRoomId);
        await fetchChatroom();
      });

      setCurrentSubscription(subscription);
      setSubscribed(true);
    }

    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe();
        setSubscribed(false);
      }
    };
  }, [chatRoomId, stompClient, userEmail]);

  const initializeUnRead = async (roomId: number) => {
    try {
      await axios.put(
        `http://3.38.196.10:8080/api/v1/unread/init`,
        {
          userEmail: userEmail,
          chatRoomId: roomId
        },
        {
          headers: {
            Authorization: localStorage.getItem("accessToken")
          }
        }
      );
      await fetchChatroom();
    } catch (error) {
      console.error("읽음 처리 실패:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      const updateChatList = async () => {
        try {
          console.log("경로 변경으로 인한 채팅 목록 갱신:", location);
          await fetchChatroom();
        } catch (error) {
          console.error("채팅 목록 갱신 실패:", error);
        }
      };

      updateChatList();
    }
  }, [location, isConnected, fetchChatroom]);

  useEffect(() => {
    if (isConnected) {
      const updateChatList = async () => {
        try {
          await fetchChatroom();
        } catch (error) {
          console.error("채팅 목록 갱신 실패:", error);
        }
      };

      const handleFocus = () => {
        updateChatList();
      };

      window.addEventListener("focus", handleFocus);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          updateChatList();
        }
      });

      return () => {
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("visibilitychange", handleFocus);
      };
    }
  }, [isConnected, fetchChatroom]);

  useEffect(() => {
    if (isopen) {
      setFnqopen(true);
      setChatopen(false);
      setMakeChatRoom(false);
    }
  }, [isopen]);

  const handleChatClick = () => {
    if (!isopen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(true);
        setFnqopen(true);
        setChatopen(false);
        setMakeChatRoom(false);
      }, 50);
    } else {
      setIsOpen(false);
      setChatRoomOpen(false);
      setFnqopen(false);
      setChatopen(false);
      setMakeChatRoom(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('input') || 
          (event.target as HTMLElement).closest('.chat-message-area') ||
          (event.target as HTMLElement).closest('.send-message-button')) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setChatRoomOpen(false);
        setFnqopen(false);
        setChatopen(false);
        setMakeChatRoom(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (chatRoomOpen) {
      messageInputRef.current?.focus();
    }
  }, [chatRoomOpen]);

  return (
    <div className="fixed bottom-[89px] right-2 z-50">
      <div ref={modalRef}>
        <div>
          {/* 채팅 문의 */}
          <div>
            <div
              className="fixed bottom-0 right-0 z-50 bg-[#f1a34a] p-4 text-xl font-bold rounded-tl-xl cursor-pointer"
              onClick={handleChatClick}>
              💬 채팅 문의
            </div>

            {(isopen || isAnimating) && (
              <div
                className={`bg-white fixed bottom-20 right-6 z-50 w-[430px] h-[750px] rounded-xl 
                shadow-[0_0_15px_rgba(0,0,0,0.2)] flex flex-col
                transform transition-all duration-300 ease-in-out
                ${isopen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                onTransitionEnd={() => {
                  if (!isopen) setIsAnimating(false);
                }}>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="px-4 pt-4">
                    {/* 채팅방 생성 */}
                    {makeChatRoom && (
                      <div className="h-full">
                        <div className="font-bold text-xl">채팅방 생성</div>
                        <div className="py-4">
                          <input
                            type="text"
                            placeholder="사용자 검색..."
                            className="w-full p-2 rounded-md shadow-sm "
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        <div className="overflow-y-auto max-h-[510px] scrollbar-hide">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.email}
                              className={`p-4 border-2 border-gray-300 rounded-xl my-1 cursor-pointer hover:bg-gray-200 transition-colors
              ${oppositeEmail === user.email ? "bg-[#f8b968]" : ""}`}
                              onClick={() => setOppositeEmail(user.email)}>
                              <div className="font-semibold">
                                {user.username?.toLowerCase().includes("naver")
                                  ? "네이버로그인 사용자"
                                  : user.username?.toLowerCase().includes("kakao")
                                    ? "카카오로그인 사용자"
                                    : user.username || "사용자"}
                              </div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 flex justify-center">
                          <button
                            className="justify-center items-center w-[150px] bg-[#f8b968] text-white text-xl py-3 px-4 rounded-md hover:scale-105 hover:transition-transform"
                            onClick={handleCreateChat}>
                            채팅방 생성
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 채팅 목록 */}
                    {chatopen && (
                      <div className="h-full overflow-y-auto scrollbar-hide">
                        <div className="text-xl font-bold mb-4">대화</div>
                        {userChatRoom.map((item) => (
                          <div
                            className="bg-gray-100 rounded-lg mb-2 p-4 cursor-pointer hover:bg-gray-200 transition-all"
                            key={item.chatRoomId}
                            onClick={() => handlechatroomopen(item.chatRoomId)}>
                            <div className="flex justify-between items-center">
                              <div className="font-bold">{item.oppositeName}</div>
                              {item.unReadCount > 0 && (
                                <div className="bg-red-600 text-white rounded-full px-2 py-0.5 text-sm">
                                  {item.unReadCount > 99 ? "99+" : item.unReadCount}
                                </div>
                              )}
                            </div>
                            {/* 마지막 메시지 표시 */}
                            <div className="text-sm text-gray-600 mt-1">
                              {item.lastMessage || `${item.oppositeName}님과의 채팅입니다.`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FnQ */}
                    {fnqopen && <FAQ isOpen={fnqopen} onClose={() => setFnqopen(false)} />}
                  </div>
                </div>

                <div className="flex justify-around items-center h-20  mt-auto rounded-b-xl">
                  <button
                    className="flex-1 flex flex-col justify-center items-center py-2 hover:text-[#f1a34a] transition-colors"
                    onClick={handlemakechatroom}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className=" mt-1">채팅방 생성</span>
                  </button>
                  <button
                    className="flex-1 flex flex-col justify-center items-center py-2 hover:text-[#f1a34a] transition-colors"
                    onClick={handlechatopen}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V12.5C20 16.9183 16.4183 20.5 12 20.5C10.5 20.5 9.5 20.3 8 19.5L4 20.5L5 16.5C4.5 15.5 4 14 4 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className=" mt-1">채팅</span>
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

      {/* 채팅방 내부*/}
      {chatRoomOpen && (
        <div className="fixed bottom-[160px] right-[24px] z-50 send-message-button">
          <div className="bg-[#f1a34a] w-[430px] h-[670px] rounded-lg">
            {/* 헤더 */}
            {userChatRoom
              .filter((item) => item.chatRoomId === chatRoomId)
              .map((item) => (
                <div className=" flex justify-between p-3 bg-white rounded-t-lg" key={item.chatRoomId}>
                  <div className="font-bold">{item.oppositeName}</div>
                  <div className="flex gap-3 cursor-pointer ">
                    <div onClick={handleChatDelete}>🗑️</div>
                    <div onClick={handleCloseChatRoom}>✖️</div>
                  </div>
                </div>
              ))}

            <div className="bg-white mx-3 mt-3 w-76 rounded-t-lg overflow-y-auto max-h-[604px] h-[560px] scrollbar-hide">
              {chatMessage.map((message, index) =>
                message.senderEmail === userEmail ? (
                  // 자신의 메시지
                  <div className="flex justify-end p-4" key={message.chatDate + index}>
                    <div className="flex flex-col items-end">
                      <div className="text-sm pb-1.5 pr-1">{message.senderName}</div>
                      <div className="flex items-end gap-1">
                        <div className="p-2 rounded-xl bg-gray-200 break-words">{message.message}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 ml-2 rounded-full min-w-10 min-h-10">
                      <img src={logo} alt="logo" className="object-cover w-full h-full" />
                    </div>
                  </div>
                ) : (
                  // 상대방의 메시지
                  <div className="flex p-4" key={message.chatDate + index}>
                    <div className="w-10 h-10 rounded-full min-w-10 min-h-10">
                      <img src={logo} alt="logo" className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <div className="ml-2 pb-1.5 text-sm">{message.senderName}</div>
                      <div className="flex items-end gap-1">
                        <div className="ml-2 p-2 rounded-xl bg-gray-200 break-words">{message.message}</div>
                      </div>
                    </div>
                  </div>
                )
              )}
              <div ref={messageEndRef} />
            </div>

            <div className="flex justify-between h-10 mx-3 bg-white border-t-2 border-black rounded-b-lg w-76">
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="p-2 text-sm w-80 focus:outline-none"
                placeholder="메시지를 입력하세요"
              />
              <div
                onClick={() => {
                  sendMessage();
                  messageInputRef.current?.focus();
                }}
                className="send-message-button px-1 text-3xl transition-transform duration-300 cursor-pointer hover:scale-105">
                ➤
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
