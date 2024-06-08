export function Spinner() {
  const spinnerStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #000000",
    animation: "spin 1s linear infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </>
  );
}
