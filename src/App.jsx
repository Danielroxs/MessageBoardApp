import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Notification from "./Notification";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ title: "", body: "" });
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentId, setCurrentId] = useState(null); // ID del mensaje que se está editando
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");

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
      <h1>Message Board App</h1>
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
          {messages
            .filter((msg) =>
              msg.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
            )
            .map((msg) => (
              <CSSTransition key={msg.id} timeout={300} classNames="message">
                <MessageCard key={msg.id}>
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
            ))}
        </TransitionGroup>

        {messages.filter((msg) =>
          msg.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        ).length === 0 && <NoResults>¡No se encontraron resultados!</NoResults>}
      </MessageList>
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
          <CharacterCount error={newMessage.title.length >= 45}>
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
          <CharacterCount error={newMessage.body.length >= 260}>
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
  background-color: #282c34;
  color: white;
  font-family: "Arial", sans-serif;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
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
  color: ${(props) => (props.error ? "#ff4d4d" : "#888")};
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

const MessageCard = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin-top: 5px;
  background-color: #3a3f47;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: auto;
  word-wrap: break-word;
  max-height: 240px;
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

  &:hover {
    background-color: #21a1f1;
  }
`;

import "./App.css";
