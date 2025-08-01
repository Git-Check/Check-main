import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useHasScanned } from "@/utils/hasScanned";
import { motion } from "framer-motion";
import { ClassPageType } from "@/types/classTypes";
import Loader from "../Loader/Loader";
import { ClassData } from "@/types/classDetailTypes";

interface MyClassPageProps {
  page: ClassPageType;
  onSelectClass: (classData: ClassData) => void;
  onPageChange: (page: ClassPageType) => void;
}

const MyClassPage = ({ onSelectClass }: MyClassPageProps) => {
  const { user, loading } = useHasScanned();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isEntering, setIsEntering] = useState(false);
  const [delayDone, setdelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setdelayDone(true);
    }, 2000); // 600ms ดีเลย์

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (loading || !user) return;

    const classesRef = collection(db, "classes");
    const q = query(classesRef, where("owner_email", "==", user.email));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const classList: ClassData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ClassData, "id">), // 👈 แคสต์เฉพาะส่วนของ data ที่ไม่ใช่ id
        }));
        setClasses(classList);
      },
    );

    return () => unsubscribe();
  }, [user, loading]);

  if (loading || !delayDone) {
    return (
      <div>
        <div className="flex justify-center items-center h-full">
          <div className="text-purple-600"><Loader /></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        <div className="overflow-scroll h-90 w-auto">
          <div className="flex flex-col gap-y-4 p-8 md:items-center">
            {isEntering ? (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader />
              </div>
            ) : classes.length > 0 ? (
              classes.map((cls) => (
                <motion.div
                  key={cls.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 1.05 }}
                >
                  <div
                    key={cls.id}
                    className=" flex justify-between md:w-100 items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-4xl shadow-lg cursor-pointer"
                    onClick={() => {
                      setIsEntering(true);
                      setTimeout(() => {
                        onSelectClass(cls);
                      }, 2000);
                    }}
                  >
                    <div className="flex flex-col gap-y-1">
                      <span className="text-lg font-semibold text-purple-800">{cls.name}</span>
                      <span className="text-base text-purple-500">{cls.checkedInCount} คน</span>
                    </div>
                    <div className="bg-purple-500 text-white text-4xl font-bold w-12 h-12 flex justify-center rounded-full shadow-lg">
                      {cls.name.charAt(0)}
                    </div>

                  </div>
                </motion.div>
              ))
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClassPage;