CREATE DATABASE IF NOT EXISTS biblioteca;

USE biblioteca;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    correo VARCHAR(255),
    contraseña VARCHAR(255)
);

-- Tabla de autores
CREATE TABLE autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255)
);

-- Tabla de libros
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    autor_id INT,
    FOREIGN KEY (autor_id) REFERENCES autores(id)
);

DELIMITER //

-- Procedimientos para usuarios
CREATE PROCEDURE sp_insert_usuario(nombre VARCHAR(255), correo VARCHAR(255), contraseña VARCHAR(255))
BEGIN
    INSERT INTO usuarios (nombre, correo, contraseña) VALUES (nombre, correo, contraseña);
END //

CREATE PROCEDURE sp_delete_usuario(usuario_id INT)
BEGIN
    DELETE FROM usuarios WHERE id = usuario_id;
END //

CREATE PROCEDURE sp_select_usuarios()
BEGIN
    SELECT * FROM usuarios;
END //

-- Procedimientos para autores
CREATE PROCEDURE sp_insert_autor(nombre VARCHAR(255))
BEGIN
    INSERT INTO autores (nombre) VALUES (nombre);
END //

CREATE PROCEDURE sp_delete_autor(autor_id INT)
BEGIN
    DELETE FROM autores WHERE id = autor_id;
END //

CREATE PROCEDURE sp_select_autores()
BEGIN
    SELECT * FROM autores;
END //

-- Procedimientos para libros
CREATE PROCEDURE sp_insert_libro(titulo VARCHAR(255), autor_id INT)
BEGIN
    INSERT INTO libros (titulo, autor_id) VALUES (titulo, autor_id);
END //

CREATE PROCEDURE sp_delete_libro(libro_id INT)
BEGIN
    DELETE FROM libros WHERE id = libro_id;
END //

CREATE PROCEDURE sp_select_libros()
BEGIN
    SELECT * FROM libros;
END //

-- Procedimiento para consultar todos los libros de un autor
CREATE PROCEDURE sp_libros_por_autor(autor_id INT)
BEGIN
    SELECT * FROM libros WHERE autor_id = autor_id;
END //

-- Procedimiento para consultar todos los autores y el número de libros que tienen
CREATE PROCEDURE sp_autores_con_libros()
BEGIN
    SELECT a.*, COUNT(l.id) AS num_libros
    FROM autores a
    LEFT JOIN libros l ON a.id = l.autor_id
    GROUP BY a.id;
END //

DELIMITER ;