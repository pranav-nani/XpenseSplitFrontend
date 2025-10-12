const BalanceCard = ({ amount, label, type }) => {
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

  let background = "";

  switch (type) {
    case "total":
      background =
        numericAmount >= 0
          ? "linear-gradient(135deg, rgba(120, 255, 172, 0.6), rgba(52, 163, 0, 0.6))" 
          : "linear-gradient(135deg, rgba(255, 107, 107, 0.6), rgba(238, 90, 36, 0.6))";
      break;

    case "owe":
      background =
        "linear-gradient(135deg, rgba(220, 38, 38, 0.6), rgba(239, 68, 68, 0.6))";
      break;

    case "owed":
      background =
        "linear-gradient(135deg, rgba(5, 150, 105, 0.6), rgba(16, 185, 129, 0.6))";
      break;

    default:
      background =
        "linear-gradient(135deg, rgba(72, 219, 251, 0.5), rgba(10, 189, 227, 0.5))";
  }

  return (
    <div className="balance-card" style={{ background }}>
      <h3>{label}</h3>
      <p>{amount}</p>
    </div>
  );
};

export default BalanceCard;
