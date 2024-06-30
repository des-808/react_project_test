import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Register from "./components/Register";
import Login from "./components/Login";
import Todo from "./components/Todo";
import Protected from "./components/Protected";
//import Game from "./components/game";
import Puzzle from "./components/puzzle"
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
 
const serverUrl = "http://192.168.7.61:5000/protected";
 
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [usernames, setUsername] = useState("");
    const [userroles, setUserRole] = useState("");
 
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            //console.log(token);
            if (token) {
                try {
                    const response = await axios.get(serverUrl, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(response.data.user);
                    setUsername(response.data.user.username);
                    setUserRole(response.data.user.role);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                }
            }
        };
        fetchData();
    });
 
    const handleLogout = async () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUsername("");
        setUserRole("");
    };

    return (
        <Router>
            <Menu
                isAuthenticated={isAuthenticated}
                username={usernames}
                handleLogout={handleLogout}
            />
            <Routes>
                    <Route  path="*"
                        element={
                            <Login
                            setIsAuthenticated={setIsAuthenticated}
                            setUsername={setUsername}
                            />
                        }>
                       
                    </Route>
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/login"
                        element={
                            <Login
                            setIsAuthenticated={setIsAuthenticated}
                            setUsername={setUsername}
                            />
                        }
                    />
                    <Route
                        path="/protected"
                        element={
                            <Protected
                                isAuthenticated={isAuthenticated}
                                username={usernames}
                                role={userroles}
                            />
                        }
                    />
                    <Route path="/game" element={<Puzzle />} />
                    <Route path="/tasks" element={<Todo />} />
                    

            </Routes>
        </Router>
    );
}
 
export default App;