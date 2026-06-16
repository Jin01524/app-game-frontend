import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './MessagingPage.module.css';

export default function MessagingPage() {
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();

  const [activeRoom, setActiveRoom] = useState('global'); // 'global' or username string
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState({}); // { username: isTyping }
  const [unreadCounts, setUnreadCounts] = useState({}); // { username: count }

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeRoomRef = useRef(activeRoom);

  // Sync activeRoom to ref for socket callback closure access
  useEffect(() => {
    activeRoomRef.current = activeRoom;
    // Clear unread count when clicking a room
    if (activeRoom !== 'global') {
      setUnreadCounts(prev => ({ ...prev, [activeRoom]: 0 }));
      authFetch('/api/messages/read', {
        method: 'POST',
        body: JSON.stringify({ senderUsername: activeRoom })
      }).catch(err => console.error('Error marking as read:', err));
    }
  }, [activeRoom, authFetch]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, []);

  // Fetch online users list
  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch('/api/profile/users/status');
      if (res.ok) {
        const data = await res.json();
        // Filter out ourselves
        setUsers(data.filter(u => u.username !== user?.username));
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  }, [authFetch, user]);

  // Fetch historical messages for active room
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const url = activeRoom === 'global' 
        ? '/api/messages/global' 
        : `/api/messages/private/${activeRoom}`;
      
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (e) {
      console.error('Error fetching chat history:', e);
    }
  }, [activeRoom, authFetch, user, scrollToBottom]);

  // Load user list and initial history
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchHistory();
      


      const interval = setInterval(fetchUsers, 20000); // refresh user states every 20s
      return () => clearInterval(interval);
    }
  }, [user, fetchUsers, fetchHistory]);

  // Handle room change
  const handleRoomSelect = (roomKey) => {
    setActiveRoom(roomKey);
    setMessages([]);
  };

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001');
    socketRef.current = io(socketUrl, {
      reconnection: true,
      transports: ['websocket', 'polling']
    });

    // Register user session
    socketRef.current.emit('msg_register', { username: user.username });

    // Global message received
    socketRef.current.on('msg_global_receive', (msg) => {
      if (activeRoomRef.current === 'global') {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    // Private message received
    socketRef.current.on('msg_private_receive', (msg) => {
      const sender = msg.sender_username;
      const recipient = msg.recipient_username;
      
      // Check if message belongs to current DM window
      const isCurrentDM = (activeRoomRef.current === sender && recipient === user.username) ||
                          (activeRoomRef.current === recipient && sender === user.username);
      
      if (isCurrentDM) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();

        // Mark as read immediately if we are active in this room and the message is from the other person
        if (sender !== user.username) {
          authFetch('/api/messages/read', {
            method: 'POST',
            body: JSON.stringify({ senderUsername: sender })
          }).catch(err => console.error('Error marking as read:', err));
        }


      } else {
        // Increment unread badge for the sender
        if (sender !== user.username) {
          setUnreadCounts(prev => ({
            ...prev,
            [sender]: (prev[sender] || 0) + 1
          }));


        }
      }
    });

    // Typing state received
    socketRef.current.on('msg_typing_receive', ({ senderUsername, recipientUsername, isTyping }) => {
      // Check if typing matches active chat window
      const isRelevant = recipientUsername 
        ? (activeRoomRef.current === senderUsername) // DM
        : (activeRoomRef.current === 'global');     // Global lobby
        
      if (isRelevant) {
        setTypingUsers(prev => ({ ...prev, [senderUsername]: isTyping }));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, scrollToBottom]);

  // Handle typing state
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    if (socketRef.current) {
      // Emit typing indicator
      socketRef.current.emit('msg_typing', {
        senderUsername: user.username,
        recipientUsername: activeRoom === 'global' ? null : activeRoom,
        isTyping: true
      });

      // Clear previous timeout and set 2s debounce to stop typing indicator
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('msg_typing', {
          senderUsername: user.username,
          recipientUsername: activeRoom === 'global' ? null : activeRoom,
          isTyping: false
        });
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = (contentToSend) => {
    const text = contentToSend || inputValue;
    if (!text.trim() || !socketRef.current) return;

    if (activeRoom === 'global') {
      socketRef.current.emit('msg_global_send', {
        senderUsername: user.username,
        content: text
      });
    } else {
      socketRef.current.emit('msg_private_send', {
        senderUsername: user.username,
        recipientUsername: activeRoom,
        content: text
      });
    }

    // Stop typing indicator immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('msg_typing', {
      senderUsername: user.username,
      recipientUsername: activeRoom === 'global' ? null : activeRoom,
      isTyping: false
    });

    if (!contentToSend) setInputValue('');
    scrollToBottom();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Helper: check if offline / online relative time
  const getRelativeTime = (lastOnline) => {
    if (!lastOnline) return 'Offline';
    const now = new Date();
    const d = new Date(lastOnline);
    const diff = (now - d) / 1000;
    if (diff < 300) return 'Online';
    if (diff < 3600) return `${Math.floor(diff/60)}p trước`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h trước`;
    return `${Math.floor(diff/86400)} ngày trước`;
  };

  const activeTypingList = Object.keys(typingUsers).filter(username => typingUsers[username] && username !== user?.username);

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ KHU VỰC NHẮN TIN RETRO ►</span>
          </div>
        </header>

        {/* Messaging Container */}
        <div className={`${styles.chatContainer} rpg-box fade-in fade-in-delay-1`}>
          
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>💬 PHÒNG CHAT</div>
            <div className={styles.roomList}>
              {/* Global Chat Button */}
              <button 
                className={`${styles.roomBtn} ${activeRoom === 'global' ? styles.activeRoom : ''}`}
                onClick={() => handleRoomSelect('global')}
              >
                <span className={styles.lobbyIcon}>🌐</span>
                <span className={styles.roomName}>Kênh Chung</span>
              </button>

              <div className={styles.sidebarDivider} />

              <div className={styles.sidebarTitle}>👥 TRỰC TUYẾN ({users.length})</div>
              {users.map(u => {
                const isOnline = u.last_online && ((new Date() - new Date(u.last_online)) / 1000 < 300);
                const hasUnread = unreadCounts[u.username] > 0;
                
                return (
                  <button
                    key={u.username}
                    className={`${styles.roomBtn} ${activeRoom === u.username ? styles.activeRoom : ''}`}
                    onClick={() => handleRoomSelect(u.username)}
                  >
                    <div className={styles.avatarWrap}>
                      {u.avatar ? (
                        <img src={u.avatar} alt="av" className={styles.userAvatar} />
                      ) : (
                        <div className={styles.avatarInitial}>{u.username[0].toUpperCase()}</div>
                      )}
                      <div className={styles.statusDot} style={{ background: isOnline ? '#10b981' : '#64748b' }} />
                    </div>
                    
                    <div className={styles.roomDetails}>
                      <span className={styles.roomName}>@{u.username}</span>
                      <span className={styles.statusText}>{getRelativeTime(u.last_online)}</span>
                    </div>

                    {hasUnread && (
                      <span className={styles.unreadBadge}>{unreadCounts[u.username]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className={styles.chatWindow}>
            {/* Room Title */}
            <div className={styles.roomHeader}>
              <span className={styles.activeTitle}>
                {activeRoom === 'global' ? '🌐 KÊNH CHUNG HỆ THỐNG' : `💬 NHẮN TIN RIÊNG: @${activeRoom}`}
              </span>
            </div>

            {/* Messages Area */}
            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <p>[ BẮT ĐẦU CUỘC TRÒ CHUYỆN ]</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>Hãy gõ biểu tượng hoặc chữ để tương tác nhé!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Normalize message structure (different between DB join queries & socket formats)
                  const senderUsername = msg.sender_username || msg.username || msg.senderUsername;
                  const displayName = msg.sender_display_name || msg.display_name || msg.displayName || senderUsername;
                  const avatar = msg.sender_avatar || msg.avatar;
                  const role = msg.sender_role || msg.role || 'user';
                  const isMe = senderUsername === user?.username;
                  
                  const isSticker = msg.content.startsWith('[STICKER: ') && msg.content.endsWith(']');
                  const stickerEmoji = isSticker ? msg.content.substring(10, msg.content.length - 1) : '';

                  return (
                    <div key={msg.id || Math.random()} className={`${styles.msgRow} ${isMe ? styles.msgMe : styles.msgOther}`}>
                      {!isMe && (
                        <div className={styles.msgAvatarWrap}>
                          {avatar ? (
                            <img src={avatar} alt="av" className={styles.msgAvatar} />
                          ) : (
                            <div className={styles.msgInitial}>{senderUsername[0].toUpperCase()}</div>
                          )}
                        </div>
                      )}

                      <div className={styles.msgBubbleWrap}>
                        <div className={styles.msgSenderInfo} style={isMe ? { justifyContent: 'flex-end', width: '100%' } : {}}>
                          {isMe ? (
                            <>
                              <span className={`${styles.roleBadge} ${role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                                {role === 'admin' ? '[ ADMIN ]' : '[ USER ]'}
                              </span>
                              <span className={styles.senderName} style={{ marginLeft: '6px' }}>{displayName} (Bạn)</span>
                            </>
                          ) : (
                            <>
                              <span className={styles.senderName}>{displayName}</span>
                              <span className={`${styles.roleBadge} ${role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                                {role === 'admin' ? '[ ADMIN ]' : '[ USER ]'}
                              </span>
                            </>
                          )}
                        </div>

                        <div className={styles.msgBubble}>
                          {msg.content}
                        </div>
                        <span className={styles.msgTime}>
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {activeTypingList.length > 0 && (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingText}>
                    💬 @{activeTypingList.join(', ')} đang gõ...
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className={styles.inputBar}>
              {/* Text Input */}
              <input
                type="text"
                className={styles.chatInput}
                placeholder="Gõ nội dung tin nhắn..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{ marginLeft: 0 }}
              />

              {/* Send Button */}
              <button 
                className={`pixel-btn ${styles.sendBtn}`}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
              >
                [ GỬI ]
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button 
          className="btn btn-outline" 
          style={{ width: '100%' }}
          onClick={() => navigate('/utilities')}
        >
          [ QUAY LẠI TIỆN ÍCH ]
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
