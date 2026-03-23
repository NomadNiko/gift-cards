export default function PaymentSuccessPage() {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h2>✓ Payment Complete</h2>
          <p>You can close this tab. Your gift voucher is being prepared.</p>
        </div>
      </body>
    </html>
  );
}
