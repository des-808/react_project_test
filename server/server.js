const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const app = express();
const port = 5000;
app.use(express.json());
app.use(cors());

//инициализация бд
const db = new sqlite3.Database("./todos.db");

//создание таблицы после инициализации бд
db.serialize(() => {
    db.run(
        "create table if not exists roles(id integer primary key autoincrement, role text unique)"
    );
 
    db.run(
        "create table if not exists users(id integer primary key autoincrement, username text unique, password text, roleid integer, foreign key(roleid) references roles(id))"
    );
 
    db.run("insert or ignore into roles(role) values('admin')");
    db.run("insert or ignore into roles(role) values('user')");
 
    db.run(
        "create table if not exists tasks(id integer primary key autoincrement, title text, deadline datetime, priority text, userid integer default null, completed byte default 0, foreign key(userid) references users(id))"
    );
});

/*----------------------------------------------АВТОРИЗАЦИЯ----------------------------------------------*/
//регистрация
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
 
    db.get("select count(*) as count from users", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        const isFirstUser = row.count == 0; //если записей в users нет
        //если записей нет, первый пользователь будт admin, остальные user
        const roleName = isFirstUser ? "admin" : "user";
 
        db.get("select id from roles where role=?", [roleName], (err, role) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
 
            db.run(
                "insert into users(username, password, roleid) values(?,?,?)",
                [username, hashedPassword, role.id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(201).json({message: "Пользователь зарегистрирован"});
                }
            );
        });
    });
});

//логин
app.post("/login", (req, res) => {
    const { username, password } = req.body;
 console.log(req.body);
    db.get(
        "select * from users where username=?",
        [username],
        async (err, user) => {
            //console.log(user);
            if (err || !user) {
                return res.status(400).json({ message: "Неверное имя пользователя" });
            }
 
            //сравнение хэшей введенного пароля и из бд
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid) {
                return res.status(400).json({ message: "Неверный пароль" });
            }
 
            //в jwt-токен запсываем данные пользователя(которые нужны)
            const token = jwt.sign({id: user.id, username: user.username, role: user.roleid}, "superpupersecretkey", {expiresIn: "1h"});
            res.json({token});
        }
    );
});

//проверка токена
const authenticateToken = (req, res, next) => {
    //получаем из заголовков запроса данные под ключом Authorization
    const authHeader = req.headers.authorization;
    //получаем токен, или, если запись вида "Bearer token", разделяем по пробелу строку на массив, забираем второй элемент(сам токен)
    const token = authHeader && authHeader.split(" ")[1];
   
    if(!token) {
        return res.status(401).json({message: "Токен не обнаружен"});
    }
    jwt.verify(token, "superpupersecretkey", (err, user) => {
        if(err) {
            //console.log(token);
            return res.status(403).json({message: "Невалидный токен"});
        }
        //записываем информацию о пользователе
        req.user = user;
        next();
    })
}

//доступ для авторизованных пользователей
app.get("/protected", authenticateToken, (req, res) => {
    db.get("select u.username, r.role from users u, roles r where u.roleid=r.id and u.id=?", [req.user.id], (err, user) => {
        if(err || !user) {
            console.log(err);
            return res.status(404).json({message: "Пользователь не найден"});            
        }
        //console.log(user);
        //console.log("--------------K------------")
        res.json({user});
    })
})


/*-------------------------------------------------------------------------------------------------------*/


//получение всех задач по id текущего пользователя
app.get("/tasks", authenticateToken, (req, res) => {
    db.all("select * from tasks where userid=? and completed=0", [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
 
//добавление новой задачи
app.post("/tasks", authenticateToken, (req, res) => {
    const { title, deadline, priority } = req.body;
    db.run(
        "insert into tasks(title, deadline, priority, userid) values(?,?,?,?)",
        [title, deadline, priority, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // res.json({ id: this.lastID }); //id последнего добавленного элемента
           res.json({ message: "Задача успешно добавлена" });
        }
    );
});
 
//изменение задачи
app.put("/tasks/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, deadline, priority } = req.body;
    db.run(
        "update tasks set title=?, deadline=?, priority=? where id=?",
        [title, deadline, priority, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ changes: this.changes }); //количество измененных строк
        }
    );
});
 
//удаление задачи
app.delete("/tasks/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run("delete from tasks where id=?", id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deleted: this.changes }); //количество измененных строк
    });
});


//выполнение задачи
app.put("/tasks/complete/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run(
        "update tasks set completed=? where id=?",
        [completed, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ changes: this.changes }); //количество измененных строк
        }
    );
});
//localhost
//запуск сервера
app.listen(port, () => {
    console.log("Сервер запущен по адресу: http://192.168.7.61:5000");
})