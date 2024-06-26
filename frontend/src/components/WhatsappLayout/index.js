import React from "react"
import Avatar from '@material-ui/core/Avatar';
import SendIcon from '@material-ui/icons/Send';
import MarkdownWrapper from "../../components/MarkdownWrapper";
import "./styles.css"

const WhatsAppLayout = ({ messages, order }) => {

    return (
        <div style={{ clear: "both", height: "100%" }}>
            <div class="page">
                <div class="marvel-device nexus5">
                    <div class="top-bar"></div>
                    <div class="sleep"></div>
                    <div class="volume"></div>
                    <div class="camera"></div>
                    <div class="screen">
                    <div class="screen-container">
                        <div class="status-bar">
                        <div class="time">3:48</div>
                        </div>
                        <div class="chat">
                        <div class="chat-container">
                            <div class="user-bar">
                            <div class="back">
                                <i class="zmdi zmdi-arrow-left"></i>
                            </div>
                            <div class="avatar">
                                <Avatar />
                            </div>
                            <div class="name">
                                <span>Contato</span>
                                <span class="status">online</span>
                            </div>
                            <div class="actions more">
                                <i class="zmdi zmdi-more-vert"></i>
                            </div>
                            <div class="actions attachment">
                                <i class="zmdi zmdi-attachment-alt"></i>
                            </div>
                            <div class="actions">
                                <i class="zmdi zmdi-phone"></i>
                            </div>
                            </div>
                            <div class="conversation">
                            <div class="conversation-container">
                            {   
                                order.map((index) => {
                                    if(messages.find(m => m.id === index).type === "text" && messages.find(m => m.id === index).value) {
                                        return (
                                                <div class="message sent">
                                                    <div style={{ maxWidth: 200, whiteSpace: "pre-wrap", overflowWrap: "break-word"}}>
                                                        <MarkdownWrapper>{messages.find(m => m.id === index).value}</MarkdownWrapper>
                                                    </div>
                                                    <span class="metadata">
                                                        <span class="time">3:46 PM</span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"></path></svg></span>
                                                    </span>
                                                </div>
                                        )
                                    } else if(messages.find(m => m.id === index).type === "file" && messages.find(m => m.id === index).value) {
                                        if(typeof messages.find(m => m.id === index).value === "string") {
                                            return (
                                                <div class="message sent">
                                                     { [".png", ".jpg", ".jpeg"].some(ext => messages.find(m => m.id === index).value.endsWith(ext)) ? 
                                                        <img 
                                                            src={`${process.env.REACT_APP_BACKEND_URL}/public/${messages.find(m => m.id === index).value.replace("file-", "")}`} 
                                                            width={200} 
                                                            height={200} 
                                                            alt="mediaLink" /> : 
                                                        [".mp4", ".mkv"].some(ext => messages.find(m => m.id === index).value.endsWith(ext)) ?
                                                            <video width={250} height={180} controls style={{ zIndex: 222222}}>
                                                                <source 
                                                                    src={`${process.env.REACT_APP_BACKEND_URL}/public/${messages.find(m => m.id === index).value.replace("file-", "")}`} 
                                                                    type="video/mp4"
                                                                >

                                                                </source>
                                                            </video> : 
                                                        [".mp3", ".ogg", ".mpeg"].some(ext => messages.find(m => m.id === index).value.endsWith(ext)) ? 
                                                            <audio controls style={{ width: 230}}>
                                                                <source 
                                                                    src={`${process.env.REACT_APP_BACKEND_URL}/public/${messages.find(m => m.id === index).value.replace("file-", "")}`} 
                                                                    type="audio/mp3"
                                                                    >
                                                                </source>
                                                            </audio> : ""
                                                     }
                                                                                 
                                                     <span class="metadata">
                                                         <span class="time">3:46 PM</span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"></path></svg></span>
                                                     </span>
                                                 </div>
                                            )
                                        } else {
                                            const file = messages.find(m => m.id === index).value
                                            return (
                                                <div class="message sent">
                                                 {file.type.includes("image") ? 
                                                    <img src={URL.createObjectURL(file)} width={200} height={200} alt="mediaLink" /> : ""
                                                 }
                                                 {file.type.includes("video") ? 
                                                    <video width={250} height={180} controls style={{ zIndex: 222222}}>
                                                        <source src={URL.createObjectURL(file)} type="video/mp4"></source>
                                                    </video>
                                                 : ""
                                                 }
                                                 {file.type.includes("audio") ? 
                                                    <audio controls style={{ width: 230}}>
                                                        <source src={URL.createObjectURL(file)} type="audio/mp3"></source>
                                                    </audio> : ""
                                                 }                            
                                                 <span class="metadata">
                                                     <span class="time">3:46 PM</span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"></path></svg></span>
                                                 </span>
                                             </div>
                                            )
                                        }
                                    } else {
                                        return ""
                                    }
                                })
                                
                            }
                                
                               
                            </div>
                            <div class="conversation-compose">
                                <div class="emoji">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="smiley" x="3147" y="3209"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z" fill="#7d8489"></path></svg>
                                </div>
                                <input class="input-msg" name="input" placeholder="Type a message" autocomplete="off" disabled />
                                <div class="photo">
                                </div>
                                <button class="send" disabled style={{ cursor: "default"}}>
                                    <div class="circle">
                                        <SendIcon />
                                    </div>
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        </div>
        
    );
}

export default WhatsAppLayout;