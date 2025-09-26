"use client";
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import QrScanner from "qr-scanner";

export default function page() {
  const [data_User_Car, setData_User_Car] = useState<any[]>([]);
  const [time, setTime] = useState<any>("");
  const [number_Mile, setNumber_Mile] = useState<any>("");

  const videoEl = useRef(null);
  const [qrData, setQrData] = useState<any>(null);
  const [scanning, setScanning] = useState<any>(false);

  useEffect(() => {
  let scanner: QrScanner | undefined;

  if (scanning && videoEl.current) {
    scanner = new QrScanner(videoEl.current, (result: string) => setQrData(result));
    scanner.start().catch(err => console.error("Scanner start failed:", err));
  }

  return () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
    }
  };
}, [scanning]);

  navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("Camera OK", stream);
  })
  .catch(err => {
    console.error("Camera access error:", err);
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");

      setTime(`${day}/${month}/${year} ${hour}:${minute}:${second}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // อัปเดตทุก 1 วิ

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const res = await fetch("http://localhost:3005/Detail_Car");
        const response = await res.json();
        setData_User_Car(response);
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };

    dataFetch(); // fetch ทันทีตอน mount

    const timer = setInterval(dataFetch, 1000); // fetch ทุก 1 วิ

    return () => clearInterval(timer); // cleanup ตอน unmount
  }, []);

  const RecordCar = async () => {
    const res = await fetch(`http://localhost:3005/Record_Car`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        car: videoEl,
        number_Mile: number_Mile,
        time: time,
      }),
    });

    console.log(res);
  };

  return (
    <>
      <div className="container">
        <div>
          <div className="status-cards row">
            {data_User_Car.map((item: any, index: number) => (
              <div className="status-card floating col-3" key={index}>
                <div className="status-info">
                  <span>ทะเบียน</span>
                  <span className="value">{item.Car_Registration}</span>
                </div>
                <div className="status-info">
                  <span>วัน/เดือน</span>
                  <span className="value">
                    {item.Out_Time
                      ? `${new Date(item.Out_Time).toLocaleDateString(
                          "th-TH"
                        )} ${item.Out_Time.split("T")[1].split(".")[0]}`
                      : "-"}
                  </span>
                </div>
                <div className="status-info">
                  <span>เลขไมล์</span>
                  <span className="value">{item.Number_Mile_Out}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-card">
          <div className="phone-container">
            <div className="phone-frame">
              <div className="phone-icon">📱</div>
            </div>
            <div className="timestamp">{time}</div>
          </div>

          {scanning && (
            <video
              ref={videoEl}
              style={{ width: "100%", height: "auto" }} // Basic styling
            />
          )}
          <div className="form-group text-center">
            <label>Scan QR</label>
            <button className="btn btn-primary" onClick={() => setScanning((prev) => !prev)}>
              {scanning ? "Stop Scan" : "Scan ป้ายทะเบียน"}
            </button>
            {scanning && (
              <video
                ref={videoEl}
                style={{ width: "100%", height: "auto" }} // Basic styling
              />
            )}
          </div>

          <div className="form-group">
            <label>เลขไมล์</label>
            <input
              type="text"
              placeholder="กรุณาใส่เลขไมล์"
              onChange={(e) => setNumber_Mile(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            onClick={() => RecordCar()}
          >
            บันทึก
          </button>
        </div>
      </div>

      <div className="avatar">N</div>
    </>
  );
}
