"use client";

import { CURRENCY } from "@/lib/utils";

interface GiftCardEmailProps {
  formData: {
    amount: number;
    recipientName: string;
    recipientEmail: string;
    personalMessage: string;
    design: {
      assetUrl: string | null;
      customImage: string | null;
      title: string;
      titleColor: string;
      cardColor: string;
      redeemButtonText: string;
      redeemButtonColor: string;
      redeemButtonTextColor: string;
    };
  };
  isPlaceholder?: boolean;
}

const GiftCardEmail = ({ formData, isPlaceholder }: GiftCardEmailProps) => {
  const { design, amount, recipientName, personalMessage } = formData;

  const containerStyle: React.CSSProperties = {
    fontFamily: "Arial, sans-serif",
    margin: "0 auto",
    padding: "20px",
    maxWidth: "600px",
    backgroundColor: "#f9f9f9",
  };

  const headerStyle: React.CSSProperties = {
    textAlign: "center",
    paddingBottom: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: design.cardColor,
    color: design.titleColor,
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  };

  const messageBoxStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "1px solid #dddddd",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "20px",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: design.redeemButtonColor,
    color: design.redeemButtonTextColor,
    padding: "12px 25px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    borderRadius: "8px",
    fontWeight: "bold",
    marginTop: "20px",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        {design.customImage ? (
          <img
            src={design.customImage}
            alt="Custom design"
            style={{ maxWidth: "150px", borderRadius: "8px" }}
          />
        ) : design.assetUrl ? (
          <img
            src={design.assetUrl}
            alt="Selected design"
            style={{ maxWidth: "150px", borderRadius: "8px" }}
          />
        ) : null}
        <h1 style={{ color: design.titleColor }}>{design.title}</h1>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>GIFT CARD</h2>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>
            {CURRENCY}
            {amount}
          </span>
        </div>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p
            style={{
              letterSpacing: "2px",
              fontFamily: "monospace",
              fontSize: "18px",
            }}
          >
            {isPlaceholder ? "GEN_GIFT_CARD_CODE" : "4000 1234 5678 9010"}
          </p>
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", textTransform: "uppercase" }}>
              Card Holder
            </p>
            <p style={{ fontWeight: "bold" }}>{recipientName}</p>
          </div>
          <div>
            <p style={{ fontSize: "12px", textTransform: "uppercase" }}>
              Expires
            </p>
            <p style={{ fontWeight: "bold" }}>12/28</p>
          </div>
        </div>
      </div>

      <div style={messageBoxStyle}>
        <p>
          <strong>Hi {recipientName},</strong>
        </p>
        <p>{personalMessage}</p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <a href="#" style={buttonStyle}>
          {design.redeemButtonText}
        </a>
      </div>
    </div>
  );
};

export default GiftCardEmail;