import styled from "styled-components";

const Notification = ({ message, type }) => {
  if (!message) return null;

  return <NotificationContainer type={type}>{message}</NotificationContainer>;
};

export default Notification;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${(props) =>
    props.type === "success" ? "#4caf50" : "#ff4d4d"};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  animation: fade-in-out 3s forwards;

  @keyframes fade-in-out {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    10% {
      opacity: 1;
      transform: translateY(0px);
    }
    90% {
      opacity: 1;
      transform: translateY(0px);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
