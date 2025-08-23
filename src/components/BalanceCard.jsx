const BalanceCard = ({ amount, label, type }) => {
  // Extract numeric value from amount (₹123 → 123)
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

  let background = "";

  switch (type) {
    case "total":
      background =
        numericAmount >= 0
          ? "linear-gradient(135deg, #78ffacff, #34a300ff)"
          : "linear-gradient(135deg, #ff6b6b, #ee5a24)";
      break;

    case "owe":
      background = "linear-gradient(135deg, #ff4c4cff, #b60000ff)";
      break;

    case "owed":
      background = "linear-gradient(135deg, #78ffacff, #34a300ff)";
      break;

    default:
      background = "linear-gradient(135deg, #48dbfb, #0abde3)";
  }

  return (
    <div className="balance-card" style={{ background }}>
      <h3>{label}</h3>
      <p>{amount}</p>
    </div>
  );
};

export default BalanceCard;
