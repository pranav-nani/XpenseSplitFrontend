import React, { useState, useEffect, useMemo } from "react";
import { settleUp } from "../api/groups";
import { toast } from "react-toastify";
import { QrCode } from "lucide-react";
import "../styles/SettleUpModal.css";

const SettleUpModal = ({
  group,
  loggedInUser,
  memberDetails,
  onClose,
  onSettled,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsOwedByUser, setPaymentsOwedByUser] = useState([]);
  const [paymentsOwedToUser, setPaymentsOwedToUser] = useState([]);

  const memberBalances = useMemo(() => {
    if (!group?.expenses) return {};
    const balances = {};
    group.members.forEach((member) => (balances[member] = 0));
    group.expenses.forEach((expense) => {
      balances[expense.paidBy] += expense.amount;
      for (const member in expense.splitWith) {
        if (balances[member] !== undefined) {
          balances[member] -= expense.splitWith[member];
        }
      }
    });
    return balances;
  }, [group]);

  useEffect(() => {
    const debtors = [];
    const creditors = [];

    for (const member in memberBalances) {
      if (memberBalances[member] < 0) {
        debtors.push({ name: member, amount: -memberBalances[member] });
      } else if (memberBalances[member] > 0) {
        creditors.push({ name: member, amount: memberBalances[member] });
      }
    }

    const allSuggestedPayments = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        allSuggestedPayments.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount,
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) debtorIndex++;
      if (creditor.amount < 0.01) creditorIndex++;
    }

    if (loggedInUser) {
      setPaymentsOwedByUser(
        allSuggestedPayments.filter((p) => p.from === loggedInUser)
      );
      setPaymentsOwedToUser(
        allSuggestedPayments.filter((p) => p.to === loggedInUser)
      );
    }
  }, [memberBalances, loggedInUser]);

  const getUpiIdForMember = (name) => {
    if (!memberDetails) return null;
    const user = memberDetails.find(
      (m) => m.username.split("_")[0] === name
    );

    return user ? user.upId : null;
  };

  const handlePayAndRecord = async (payment) => {
    setIsLoading(true);

    try {
      console.log("Simulating a dummy payment process...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const settlementData = {
        payer: payment.from,
        payee: payment.to,
        amount: payment.amount,
      };

      await settleUp(group.id, settlementData);

      toast.success(`Payment to ${payment.to} recorded successfully!`);
      onSettled();
    } catch (error) {
      console.error("Failed to record settlement:", error);
      toast.error("Failed to record settlement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const noPendingPayments =
    paymentsOwedByUser.length === 0 && paymentsOwedToUser.length === 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content settle-up-modal" style={{maxWidth:"800px"}}>
        <div className="modal-header">
          <h2>Settle Up</h2>
          <button
            onClick={onClose}
            className="close-button"
            disabled={isLoading}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {noPendingPayments ? (
            <div className="no-payments-needed">
              <p>🎉 You are all settled up in this group!</p>
            </div>
          ) : (
            <>
              {paymentsOwedByUser.length > 0 && (
                <div className="payments-section">
                  <h4>You Owe</h4>
                  <ul className="payments-list">
                    {paymentsOwedByUser.map((payment, index) => {
                      const payeeUpiId = getUpiIdForMember(payment.to);
                      const note = encodeURIComponent(
                        `Payment for ${group.groupName}`
                      );
                      const upiString = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(
                        payment.to
                      )}&am=${payment.amount.toFixed(2)}&cu=INR&tn=${note}`;

                      return (
                        <li key={`owe-${index}`} className="payment-item">
                          <div className="payment-info">
                            <span className="payer">You</span>
                            <span className="arrow">→</span>
                            <span className="payee">{payment.to}</span>
                            <span className="amount">
                              ₹{payment.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="payment-action">
                            <div className="qr-code-container">
                              <p className="qr-label">Scan to Pay</p>
                              {payeeUpiId ? (
                                <QrCode value={upiString} size={80} />
                              ) : (
                                <small>No UPI ID</small>
                              )}
                            </div>
                            <button
                              className="btn btn-primary"
                              onClick={() => handlePayAndRecord(payment)}
                              disabled={isLoading || !payeeUpiId}>
                              {isLoading ? "Processing..." : "📱 Pay & Record"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {paymentsOwedToUser.length > 0 && (
                <div className="payments-section">
                  <h4>You Are Owed</h4>
                  <ul className="payments-list">
                    {paymentsOwedToUser.map((payment, index) => (
                      <li
                        key={`owed-${index}`}
                        className="payment-item readonly">
                        <div className="payment-info">
                          <span className="payer">{payment.from}</span>
                          <span className="arrow">→</span>
                          <span className="payee">You</span>
                          <span className="amount">
                            ₹{payment.amount.toFixed(2)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettleUpModal;
