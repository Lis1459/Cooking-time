import { Link } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";

export const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>О проекте</h4>
            <p>Cooking Time — это лучшая платформа для обмена рецептами.</p>
          </div>
          <div className="footer-section">
            <h4>Быстрые ссылки</h4>
            <ul>
              <li>
                <Link to="/recipes">Рецепты</Link>
              </li>
              <li>
                <Link to="/smart-recipes">Умный поиск</Link>
              </li>
              <li>
                <Link to="/about">О нас</Link>
              </li>
              <li>
                <Link to="/license-agreement">Лицензионное соглашение</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Эл. почта: info@cookingtime.com</p>
            <p>Телефон: +375 29 896 3019</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Cooking Time. Все права защищены</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
