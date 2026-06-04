const StarIcon = ({ filled, size = "16" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "gold" : "none"}
    stroke="gold"
    strokeWidth="2"
  >
    <path d="M12 2l2.9 6.26 6.9.55-5.2 4.73 1.6 6.71L12 17.77 5.8 20.25l1.6-6.71-5.2-4.73 6.9-.55L12 2z" />
  </svg>
);

export default StarIcon;
