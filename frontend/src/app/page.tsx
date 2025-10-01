"use client";
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const [NumberIn, setNumberIn] = useState<number>(0);
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

  // ฟังก์ชันเลื่อน focus
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
    // ให้ช่องแรกบังคับ focus ใหม่ ถ้าไม่ได้กำลังจะไป input อื่นใน form
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
    <div className="background-CIO">
      <h2 className="mx-5 text-white">SCAN IN-OUT</h2>
      <div className="form-input">
        <div className="row mx-4 mt-4">
          <div className="col-2 border-right bg-body">
            <div className="fs-5 text-center p-2 border border-2 border">
              <div>{time.toLocaleDateString("th-TH")} </div>
              <div>{time.toLocaleTimeString("th-TH", { hour12: false })}</div>
            </div>
            <div className="mt-2">
              <label>ป้ายทะเบียนรถ</label>
              <input
                value={Car_Register}
                ref={(el) => (inputRefs.current[0] = el)}
                className="form-control"
                onChange={(e) => setCar_Register(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                onBlur={() => handleBlur(0)}
              />
            </div>
            <div className="mt-3">
              <div className="">พนักงาน</div>
              <input
                value={Name_Person1}
                ref={(el) => (inputRefs.current[1] = el)}
                className="form-control"
                onChange={(e) => setName_Person1(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
              />
              <input
                value={Name_Person2}
                ref={(el) => (inputRefs.current[2] = el)}
                className="form-control mt-2"
                onChange={(e) => setName_Person2(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
              />
              <input
                value={Name_Person3}
                ref={(el) => (inputRefs.current[3] = el)}
                className="form-control mt-2"
                onChange={(e) => setName_Person3(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 3)}
              />
              <input
                value={Name_Person4}
                ref={(el) => (inputRefs.current[4] = el)}
                className="form-control mt-2"
                onChange={(e) => setName_Person4(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 4)}
              />
              <input
                value={Name_Person5}
                ref={(el) => (inputRefs.current[5] = el)}
                className="form-control mt-2"
                onChange={(e) => setName_Person5(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 5)}
              />
            </div>
            <div className="mt-2">
              <label>โครงการ</label>
              <input
                value={project}
                ref={(el) => (inputRefs.current[6] = el)}
                className="form-control"
                onChange={(e) => setProject(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 6)}
                onBlur={() => handleBlur(0)}
              />
            </div>
            <div>
              <label className="mt-3">เลขไมค์ออกโรงงาน</label>
              <input
                value={NumberOut}
                ref={(el) => (inputRefs.current[7] = el)}
                className="form-control"
                onChange={(e) => setNumberOut(Number(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 7)}
              />
            </div>
            <div>
              <label className="mt-3">เลขไมค์เข้าโรงงาน</label>
              <input
                value={NumberIn}
                ref={(el) => (inputRefs.current[8] = el)}
                className="form-control"
                onChange={(e) => setNumberIn(Number(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 8)}
                disabled={TrueMileIn ? false : true}
              />
            </div>
            <div>
              <button
                className="btn btn-primary p-3 w-100 mt-3"
                onClick={() => Submit()}
              >
                บันทึก
              </button>
            </div>
          </div>
          <div className="col-10">
            <div className="bg-body overflow-auto">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th className="text-center">โครงการ</th>
                    <th className="text-center">ป้ายทะเบียน</th>
                    <th className="text-center">ชื่อพนักงาน</th>
                    <th className="text-center">ออก</th>
                    <th className="text-center">เข้า</th>
                  </tr>
                </thead>
                <tbody className="cursor-pointer">
                  {data.map((item, index) => (
                    <tr key={index} onClick={() => SelectValue(item.ID)}>
                      <td className="text-center align-content-center">
                        {item.Project}
                      </td>
                      <td className="text-center align-content-center">
                        {item.Car_Registration}
                      </td>
                      <td>
                        {item.Name.split("|").map(
                          (
                            name: string,
                            index: React.Key | null | undefined
                          ) => (
                            <span key={index}>
                              {name.trim()}
                              <br />
                            </span>
                          )
                        )}
                      </td>
                      <td className="text-center align-content-center">
                        <div>
                          {item.Out_Time.split("T")[0]}{" "}
                          {
                            item.Out_Time.split("T")[1]
                              .split("Z")[0]
                              .split(".")[0]
                          }
                        </div>
                        <div>({item.Number_Mile_Out})</div>
                      </td>
                      <td className="text-center align-content-center">
                        <div>
                          {item.In_Time ? item.In_Time.split("T")[0] : ""}{" "}
                          {item.In_Time
                            ? item.In_Time.split("T")[1]
                                .split("Z")[0]
                                .split(".")[0]
                            : ""}
                        </div>
                        <div>
                          {item.Number_Mile_In
                            ? `(${item.Number_Mile_In})`
                            : ""}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
