import React, { useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import Notification from "./Notification";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import PropTypes from "prop-types";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ title: "", body: "" });
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentId, setCurrentId] = useState(null); // ID del mensaje que se está editando
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pagina actual
  const messagesPerPage = 5; // Mensajes por pagina
  const refs = useRef({});

  const filteredMessages = useMemo(() => {
    return messages.filter(
      (msg) =>
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const currentMessages = useMemo(() => {
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    return filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  }, [filteredMessages, currentPage, messagesPerPage]);

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const MessageCard = React.forwardRef((props, ref) => (
    <StyledMessageCard ref={ref} {...props}>
      {props.children}
    </StyledMessageCard>
  ));

  MessageCard.propTypes = {
    children: PropTypes.node.isRequired, // 'children es obligatorio'
  };

  MessageCard.displayName = "MessageCard";

  // Función para obtener los mensajes desde el backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:3000/messages");
        setMessages(response.data); // Actualiza el estado con los mensajes obtenidos
      } catch (error) {
        console.error("Error al obtener los mensajes:", error);
      }
    };

    fetchMessages();
  }, []);

  // Mostrar notificaciones y limpiar el mensaje después de 3 segundos
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.title && newMessage.body) {
      try {
        if (isEditing) {
          // Solicitud PUT para editar un mensaje existente
          const response = await axios.put(
            `http://localhost:3000/messages/${currentId}`,
            newMessage
          );
          setMessages(
            messages.map((msg) => (msg.id === currentId ? response.data : msg))
          );
          showNotification("Mensaje editado con éxito", "success");
          setIsEditing(false);
          setCurrentId(null);
        } else {
          const response = await axios.post(
            "http://localhost:3000/messages",
            newMessage
          );
          setMessages([...messages, response.data]);
          showNotification("Mensaje agregado con éxito", "success");
        }
        setNewMessage({ title: "", body: "" });
      } catch (error) {
        console.error("Error al agregar o editar el mensaje:", error);
        showNotification("Ocurrió un error al guardar el mensaje", "error");
      }
    }
  };

  const handleEdit = (msg) => {
    setIsEditing(true);
    setCurrentId(msg.id);
    setNewMessage({ title: msg.title, body: msg.body });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/messages/${id}`);
      setMessages(messages.filter((msg) => msg.id !== id)); // Actualiza el estado eliminando el mensaje
      showNotification("Mensaje eliminado con exito", "success");
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error);
      showNotification("Ocurrio un error al eliminar el mensaje", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title" && value.length > 50) return;
    if (name === "body" && value.length > 280) return;

    setNewMessage({ ...newMessage, [name]: value });
  };

  return (
    <Container>
      <Notification message={notification.message} type={notification.type} />
      <Header>Message Board App</Header>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar mensajes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ClearButton onClick={() => setSearchTerm("")}>X</ClearButton>
        )}
      </SearchContainer>

      <MessageList>
        <TransitionGroup component={MessageList}>
          {currentMessages.map((msg) => {
            if (!refs.current[msg.id]) {
              refs.current[msg.id] = React.createRef(); // crea una referencia sino existe
            }

            return (
              <CSSTransition
                key={msg.id}
                nodeRef={refs.current[msg.id]}
                timeout={300}
                classNames="message"
              >
                <MessageCard ref={refs.current[msg.id]}>
                  <h3>{msg.title}</h3>
                  <p>{msg.body}</p>
                  <ButtonGroup>
                    <EditButton onClick={() => handleEdit(msg)}>
                      Editar
                    </EditButton>
                    <DeleteButton onClick={() => handleDelete(msg.id)}>
                      Eliminar
                    </DeleteButton>
                  </ButtonGroup>
                </MessageCard>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
        {currentMessages.length === 0 && (
          <NoResults>¡No se encontraron resultados!</NoResults>
        )}
      </MessageList>

      <Pagination>
        {[...Array(totalPages)].map((_, index) => (
          <PageButton
            key={index}
            $isActive={index + 1 === currentPage}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </PageButton>
        ))}
      </Pagination>

      <Form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            type="text"
            name="title"
            value={newMessage.title}
            onChange={handleChange}
            placeholder="titulo del mensaje"
            required
          />
          <CharacterCount $error={newMessage.title.length >= 45}>
            {50 - newMessage.title.length} Caracteres restantes
          </CharacterCount>
        </InputContainer>

        <InputContainer>
          <Textarea
            name="body"
            value={newMessage.body}
            onChange={handleChange}
            placeholder="Escribe aqui tu mensaje"
            required
          />
          <CharacterCount $error={newMessage.body.length >= 260}>
            {280 - newMessage.body.length} Caracteres restantes
          </CharacterCount>
        </InputContainer>

        <Button type="submit">
          {isEditing ? "Guardar cambios" : "Agregar mensaje"}
        </Button>
      </Form>
    </Container>
  );
};

export default App;

// Estilos con styled-components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #282c34, #3a3f47);
  color: white;
  font-family: "Arial", sans-serif;
`;

const Header = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: #61dafb;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
`;

const StyledMessageCard = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin-top: 5px;
  background-color: #3a3f47;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: auto;
  word-wrap: break-word;
  max-height: 240px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
`;

const Pagination = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 35px;
`;

const PageButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.$isActive ? "#21a1f1" : "#e0e0e0")};
  color: ${(props) => (props.$isActive ? "#fff" : "#000")};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #21a1f1;
    color: #fff;
  }
`;

const SearchInput = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  max-width: 600px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin-right: 20px;
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: ${(props) => (props.$error ? "#ff4d4d" : "#888")};
  margin-top: 5px;
  position: absolute;
  bottom: -20px;
  right: 0;
  width: 100%;
`;

const ClearButton = styled.button`
  position: absolute;
  top: 20px;
  right: -10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 5px;

  &:hover {
    color: #ff4d4d;
  }
`;

const NoResults = styled.div`
  text-align: center;
  color: #ff4d4d;
  font-size: 16px;
  margin-top: 10px;
  font-weight: bold;
  padding: 10px;
  background-color: #3a3f47;
  border-radius: 8px;
  border: 1px solid #ff4d4d;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const EditButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  font-size: 12px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #ff4d4d;
  color: white;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const Textarea = styled.textarea`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  resize: none;
  width: 100%;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #61dafb;
  color: #282c34;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #21a1f1;
    transform: translateY(-2px);
  }
`;

import "./App.css";
