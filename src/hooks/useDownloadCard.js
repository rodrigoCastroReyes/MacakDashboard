import html2canvas from "html2canvas";

const useDownloadCard = () => {
  const downloadCard = async (ref, filename = "grafico") => {
    if (!ref?.current) return;
    const canvas = await html2canvas(ref.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return { downloadCard };
};

export default useDownloadCard;