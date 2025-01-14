import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState({ title: "", body: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.title && newMessage.body) {
      try {
        const response = await axios.post(
          "http://localhost:3000/messages",
          newMessage
        );
        setMessages([...messages, response.data]); // Agrega el nuevo mensaje al estado
        setNewMessage({ title: "", body: "" }); // limpiar el formulario
      } catch (error) {
        console.error("Error al agregar el mensaje", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/messages/${id}`);
      setMessages(messages.filter((msg) => msg.id !== id)); // Actualiza el estado eliminando el mensaje
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({ ...newMessage, [name]: value });
  };

  return (
    <Container>
      <h1>Message Board App</h1>
      <MessageList>
        {messages.map((msg) => (
          <MessageCard key={msg.id}>
            <h3>{msg.title}</h3>
            <p>{msg.body}</p>
            <DeleteButton onClick={() => handleDelete(msg.id)}>
              Eliminar
            </DeleteButton>
          </MessageCard>
        ))}
      </MessageList>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          value={newMessage.title}
          onChange={handleChange}
          placeholder="titulo del mensaje"
          required
        />
        <Textarea
          name="body"
          value={newMessage.body}
          onChange={handleChange}
          placeholder="Escribe aqui tu mensaje"
          required
        />
        <Button type="submit">Agregar mensaje</Button>
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
  width: 100%;
  max-width: 600px;
`;

const MessageCard = styled.div`
  padding: 15px;
  border-radius: 8px;
  background-color: #3a3f47;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
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
`;

const Textarea = styled.textarea`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  resize: none;
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