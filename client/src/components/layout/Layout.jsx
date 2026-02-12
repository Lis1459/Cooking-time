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
            <h4>About</h4>
            <p>Cooking Time is your ultimate recipe sharing platform.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/recipes">Recipes</a>
              </li>
              <li>
                <a href="/categories">Categories</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@cookingtime.com</p>
            <p>Phone: +1 234 567 8900</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Cooking Time. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
