import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import Footer from "../Footer";
import Map from "../Map";
import AlreadyBorrowed from "./AlreadyBorrowed";
import MyOffers from "./MyOffers";
import MyPosts from "./MyPosts";
import NeighborsRequests from "./NeighborsRequests";
import WaitingApproval from "./WaitingApproval";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "@firebase/storage";

const Dashboard = () => {
  const { User, setUser } = useContext(UserContext);
  const [edit_profile, setEdit_profile] = useState(false);
  const [err, setErr] = useState("");
  const [CurrentUser, setCurrentUser] = useState("");
  const noteRest = useRef(null);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [pulledMark, setPulledMark] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState("");

  window.onclick = (e) => {
    if (e.target === noteRest.current) {
      setEdit_profile(false);
      //   getPost();
    }
  };

  const pull_mark = (data) => setPulledMark(data);

  const update_profile = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.put(
        `${BASE_URL}/update_user`,
        {
          id: User?.result?._id,
          currentMobile: User?.result?.mobile,
          username: e.target.username.value,
          mobile: e.target.mobile.value,
          password: e.target.password.value,
          location: e.target.location.value,
        },
        { headers: { Authorization: `Bearer ${User.token}` } }
      );
      if (result.data == "user info updated") {
        setEdit_profile(false);
        getUser();
      }
      if (result.data?.err) setErr(result.data.err);
    } catch (error) {
      console.log(error);
    }
  };

  const update_profile_image = async () => {
    try {
      const result = await axios.put(
        `${BASE_URL}/update_user`,
        {
          id: User?.result?._id,
          avatar: images
        },
        { headers: { Authorization: `Bearer ${User.token}` } }
      );
        getUser();
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      const result = await axios.get(`${BASE_URL}/get_user`, { headers: { Authorization: `Bearer ${User.token}` } });
      if (result.data) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (User) getUser();
  }, [User]);


  const uploadPictures = (e) => {
    let image = e.target.files[0];
    const dataType = image.name.match(/\.(jpe?g|png|gif)$/gi);
    if (image == null || dataType == null) return;
    const storageRef = ref(storage, `images/${image.name}`);
    const uploadImamge = uploadBytesResumable(storageRef, image);
    uploadImamge.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadImamge.snapshot.ref).then((url) => {
          setImages(url);
        });
      }
    );
  };

  useEffect(() => {
    setProgress(0);
    if(images) update_profile_image()
  }, [images]);


  return (
    <div>
      <div className="dashboard">
        <div className="profile_content">
          {/* <p>
            *****
            <br />
            rating
          </p> */}
          <div className="profile">
            <img src={CurrentUser?.avatar} alt="profile imag" width="60%" height="200px" />

              <input
                type="file"
                accept=".gif,.jpg,.jpeg,.png"
                onChange={(e) => {
                  uploadPictures(e);
                }}
                id="img"
                style={{ display: "none" }}
              />
              <label htmlFor="img" id="edit_profile_image">
               تعديل
              </label>
              {!(progress == 0) ? (
                <div className="progress">
                  <p>قيد الرفع {progress}%</p>
                </div>
              ) : null}

            <p>{CurrentUser?.username}</p>
          </div>
          <div className="profile_info" dir="rtl">
            <div>
              <p>
                <b>اسم الحساب</b>
              </p>
              <p>{CurrentUser?.username}</p>
            </div>
            <hr />
            <div>
              <p>
                <b>رقم الجوال</b>
              </p>
              <p>{CurrentUser?.mobile}</p>
            </div>
            <hr />
            <div>
              <p>
                <b>موقع البيت</b>
              </p>
              <p>{CurrentUser?.location}</p>
            </div>

            <button onClick={() => setEdit_profile(true)}>تعديل على بيانات الحساب</button>
          </div>
        </div>
        <div className="dashboard_borrowed_items">
          <div className="borrowed">
            <p> طلبات من المستخدمين بانتظار قبولها منك</p>
            <NeighborsRequests />
          </div>
          <div className="borrowed">
            <p>المستعار حالياً</p>
            <AlreadyBorrowed />
          </div>
          <div className="borrowed">
            <p>بإنتظار موافقة صاحب السلعة</p>
            <WaitingApproval />
          </div>
          <div className="borrowed">
            <p>إعلاناتي</p>
            <MyPosts />
          </div>
          <div className="borrowed">
            <p>إعلانات تم تقديم المساعدة لها</p>
            <MyOffers />
          </div>
        </div>
      </div>

      {edit_profile ? (
        <div>
          <form onSubmit={update_profile} dir="rtl">
            <div className="notePageRest" ref={noteRest}>
              <div className="edit edit_form">
                <div>
                  <label htmlFor="username">الاسم الشخصي</label>
                  <input type="text" name="username" defaultValue={User?.result?.username} />
                  <br />
                  <label htmlFor="mobile">رقم الجوال</label>
                  <input type="text" name="mobile" defaultValue={User?.result?.mobile} />
                  <br />
                  <label htmlFor="password">الرقم السري</label>
                  <input type="password" name="password" placeholder="رقم سري جديد؟" />
                  <br />
                  <label htmlFor="location">الموقع الجغرافي</label>
                  <input
                    type="text"
                    name="location"
                    value={pulledMark.lat ? pulledMark.lat + "," + pulledMark.lng : User?.result?.location}
                  />
                  <button type="button" onClick={() => setShowMap(true)}>
                    تغيير الموقع
                  </button>
                  {err ? <p>err</p> : <></>}
                  <div id="iii">
                    <button
                      id="back_note_page"
                      onClick={() => {
                        setEdit_profile(false);
                      }}
                    >
                      الغاء
                    </button>
                    <button type="submit">حفظ التعديلات</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <></>
      )}

      {showMap ? (
        <div className="map_container">
          <div className="map">
            <Map mark={pull_mark} />
            <span onClick={() => setShowMap(false)}>
              <i class="fas fa-times"></i>
            </span>
            <button onClick={() => setShowMap(false)}>موافق</button>
          </div>
        </div>
      ) : (
        <></>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
