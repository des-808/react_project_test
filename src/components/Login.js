import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
 
const serverUrl = "http://192.168.7.61:5000/login";
 
const Login = ({ setIsAuthenticated, setUsername }) => {
    const [username, setUsernameState] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(serverUrl, {
                username,
                password,
            });
            localStorage.setItem("token", response.data.token);
            setIsAuthenticated(true);
            setUsername(username);
            navigate("/tasks");
        } catch (error) {
            console.error(error);
            console.log(error);

            setError("Ошибка входа: ", error);
            //setError(error);
        }
    };
 
    return (
        <div className="container">
            <h2 className="mb-5">Вход</h2>
 
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
 
            <form onSubmit={handleSubmit}>
                <div className="form-group my-2">
                    <label htmlFor="username" className="form-label">
                        Имя пользователя:{" "}
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsernameState(e.target.value)}
                    />
                </div>
                <div className="form-group my-2">
                    <label htmlFor="password" className="form-label">
                        Пароль:{" "}
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline-primary my-2" type="submit">
                    Войти
                </button>
            </form>
        </div>
    );
};
 
export default Login;