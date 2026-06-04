const FireIcon = ({ active = true }) => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
    {/* внешнее пламя */}
    <path
      d="M12 2C12 2 7 7 7 11a5 5 0 0 0 10 0c0-4-5-9-5-9z"
      fill={active ? "#ff6b00" : "none"}
      stroke="#ff6b00"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* внутренний язык огня */}
    <path
      d="M12 8c0 0-2 2-2 4a2 2 0 0 0 4 0c0-2-2-4-2-4z"
      fill={active ? "#ffd166" : "none"}
    />
  </svg>
);

export default FireIcon;
