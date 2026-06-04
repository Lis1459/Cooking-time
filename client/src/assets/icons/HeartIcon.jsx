const HeartIcon = ({ active }) => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="#000"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      color: active ? "var(--primary-dark)" : "#000",
      transition: "0.2s ease",
    }}
  >
    <path d="M20.8 8.6c0 5.2-8.8 11.4-8.8 11.4S3.2 13.8 3.2 8.6C3.2 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4c2.6 0 4.6 2 4.6 4.6z" />
  </svg>
);

export default HeartIcon;
