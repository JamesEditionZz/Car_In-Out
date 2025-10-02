"use client";
import React, { useEffect, useRef, useState } from "react";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [project, setProject] = useState<string>("");
  const [Name_Person1, setName_Person1] = useState<string>("");
  const [Name_Person2, setName_Person2] = useState<string>("");
  const [Name_Person3, setName_Person3] = useState<string>("");
  const [Name_Person4, setName_Person4] = useState<string>("");
  const [Name_Person5, setName_Person5] = useState<string>("");
  const [time, setTime] = useState<Date>(new Date());
  const [Car_Register, setCar_Register] = useState<string>("");
  const [NumberOut, setNumberOut] = useState<number>(0);
  const [NumberIn, setNumberIn] = useState<number>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [TrueMileIn, setTrueMileIn] = useState<boolean>(false);

  // เวลา
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    const datafecth = async () => {
      const res = await fetch("http://localhost:3005/API/Detail_Car");
      const data = await res.json();
      setData(data);
    };
    datafecth();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBlur = (index: number) => {
    setTimeout(() => {
      const active = document.activeElement as HTMLElement;
      const isInsideForm = inputRefs.current.includes(
        active as HTMLInputElement
      );
      if (!isInsideForm && inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }
    }, 0);
  };

  const Submit = async () => {
    if (NumberIn > 0) {
      if (NumberIn <= NumberOut) {
        alert("ระบุเลขไมค์ไม่ถูกต้อง");
        setNumberIn(0);
        const nextInput = inputRefs.current[7];
        if (nextInput) {
          nextInput.focus();
        }
        return;
      }

      const Name_Person = [
        Name_Person1,
        Name_Person2,
        Name_Person3,
        Name_Person4,
        Name_Person5,
      ]
        .filter((name) => name.trim() !== "")
        .join(", ");

      const newEntry = {
        date: time.toLocaleDateString("th-TH"),
        time: time.toLocaleTimeString("th-TH", { hour12: false }),
        carRegister: Car_Register,
        namePerson: Name_Person,
        numberOut: NumberOut > 0 ? NumberOut : "",
        numberIn: NumberIn > 0 ? NumberIn : "",
      };

      const res = await fetch("http://localhost:3005/API/Record_Car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const res = await fetch("http://localhost:3005/API/Detail_Car");
        const data = await res.json();
        setData(data);
      }

      setProject("");
      setCar_Register("");
      setName_Person1("");
      setName_Person2("");
      setName_Person3("");
      setName_Person4("");
      setName_Person5("");
      setNumberOut(0);
      setNumberIn(0);
      setTrueMileIn(false);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } else if (NumberIn === 0) {
      const Name_Person = [
        Name_Person1,
        Name_Person2,
        Name_Person3,
        Name_Person4,
        Name_Person5,
      ]
        .filter((name) => name.trim() !== "")
        .join(", ");

      const newEntry = {
        Project: project,
        date: time.toLocaleDateString("th-TH"),
        time: time.toLocaleTimeString("th-TH", { hour12: false }),
        carRegister: Car_Register,
        namePerson: Name_Person,
        numberOut: NumberOut > 0 ? NumberOut : "",
        numberIn: NumberIn > 0 ? NumberIn : "",
      };

      const res = await fetch("http://localhost:3005/API/Record_Car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const res = await fetch("http://localhost:3005/API/Detail_Car");
        const data = await res.json();
        setData(data);
      }
    }
  };

  const SelectValue = (ID?: any) => {
    const selectedItem = data.find((item) => item.ID === ID);
    if (!selectedItem) return;

    setProject(selectedItem.Project);
    setCar_Register(selectedItem.Car_Registration);
    const names = selectedItem.Name.split("|");
    setName_Person1(names[0] || "");
    setName_Person2(names[1] || "");
    setName_Person3(names[2] || "");
    setName_Person4(names[3] || "");
    setName_Person5(names[4] || "");
    setNumberOut(selectedItem.Number_Mile_Out || 0);

    setTrueMileIn(true);

    const nextInput = inputRefs.current[8];
    if (nextInput) {
      nextInput.focus();
    }
  };

  return (
    <div className="container">
      <div className="header">SCAN IN-OUT</div>

      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="datetime-box">
            <div className="date">{time.toLocaleDateString("th-TH")}</div>
            <div className="time">
              {time.toLocaleTimeString("th-TH", { hour12: false })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ป้ายทะเบียนรถ</label>
            <input
              value={Car_Register}
              ref={(el) => (inputRefs.current[0] = el)}
              className="form-input highlighted"
              onChange={(e) => setCar_Register(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              onBlur={() => handleBlur(0)}
              disabled={TrueMileIn}
            />
          </div>

          <div className="form-group">
            <label className="form-label">พนักงาน</label>
            <input
              value={Name_Person1}
              ref={(el) => (inputRefs.current[1] = el)}
              className="form-input"
              onChange={(e) => setName_Person1(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              disabled={TrueMileIn}
            />
            <input
              value={Name_Person2}
              ref={(el) => (inputRefs.current[2] = el)}
              className="form-input"
              style={{ marginTop: "8px" }}
              onChange={(e) => setName_Person2(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 2)}
              disabled={TrueMileIn}
            />
            <input
              value={Name_Person3}
              ref={(el) => (inputRefs.current[3] = el)}
              className="form-input"
              style={{ marginTop: "8px" }}
              onChange={(e) => setName_Person3(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 3)}
              disabled={TrueMileIn}
            />
            <input
              value={Name_Person4}
              ref={(el) => (inputRefs.current[4] = el)}
              className="form-input"
              style={{ marginTop: "8px" }}
              onChange={(e) => setName_Person4(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 4)}
              disabled={TrueMileIn}
            />
            <input
              value={Name_Person5}
              ref={(el) => (inputRefs.current[5] = el)}
              className="form-input"
              style={{ marginTop: "8px" }}
              onChange={(e) => setName_Person5(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 5)}
              disabled={TrueMileIn}
            />
          </div>

          <div className="form-group">
            <label className="form-label">โครงการ</label>
            <input
              value={project}
              ref={(el) => (inputRefs.current[6] = el)}
              className="form-input"
              onChange={(e) => setProject(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 6)}
              onBlur={() => handleBlur(0)}
              disabled={TrueMileIn}
            />
          </div>

          <div className="form-group">
            <label className="form-label">เลขไมค์ออกโรงงาน</label>
            <input
              value={NumberOut}
              ref={(el) => (inputRefs.current[7] = el)}
              className="form-input"
              onChange={(e) => setNumberOut(Number(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, 7)}
              disabled={TrueMileIn}
            />
          </div>

          <div className="form-group">
            <label className="form-label">เลขไมค์เข้าโรงงาน</label>
            <input
              value={NumberIn}
              ref={(el) => (inputRefs.current[8] = el)}
              className="form-input"
              onChange={(e) => setNumberIn(Number(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, 8)}
              disabled={!TrueMileIn}
              style={{ opacity: TrueMileIn ? 1 : 0.5 }}
            />
          </div>

          <button className="submit-btn" onClick={() => Submit()}>
            บันทึก
          </button>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>โครงการ</th>
                  <th>ป้ายทะเบียน</th>
                  <th>ชื่อพนักงาน</th>
                  <th>ออก</th>
                  <th>เข้า</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => SelectValue(item.ID)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item.Project}</td>
                    <td>{item.Car_Registration}</td>
                    <td>
                      <div className="employee-info">
                        {item.Name.split("|").map(
                          (name: string, idx: number) => (
                            <span key={idx} className="employee-name">
                              {name.trim()}
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="time-badge">
                        {item.Out_Time.split("T")[0]}{" "}
                        {item.Out_Time.split("T")[1].split("Z")[0].split(".")[0]}
                      </div>
                      <div className="id-badge">({item.Number_Mile_Out})</div>
                    </td>
                    <td>
                      {item.In_Time && (
                        <>
                          <div className="time-badge">
                            {item.In_Time.split("T")[0]}{" "}
                            {item.In_Time.split("T")[1].split("Z")[0].split(".")[0]}
                          </div>
                          {item.Number_Mile_In && (
                            <div className="id-badge">
                              ({item.Number_Mile_In})
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}