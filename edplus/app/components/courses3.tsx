import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    category: "JavaScript",
    image: "/assets/img/courses/1.jpg",
    rating: "(4.33 / 3 Rating)",
    title: "The Complete JavaScript Course 2026",
    students: "3 Students",
    lessons: "14 Lessons",
    price: "$25",
    author: "Masum Billah",
    authorImage: "/assets/img/courses/author/1.png",
  },
  {
    category: "Business",
    image: "/assets/img/courses/2.jpg",
    rating: "(4.8 / 3 Rating)",
    title: "SEO as the Core of Your New Business Venture",
    students: "3 Students",
    lessons: "14 Lessons",
    price: "Free",
    author: "Masum Billah",
    authorImage: "/assets/img/courses/author/1.png",
  },
  {
    category: "WordPress",
    image: "/assets/img/courses/3.jpg",
    rating: "(4.33 / 3 Rating)",
    title: "WordPress for Beginners – Master WordPress",
    students: "3 Students",
    lessons: "14 Lessons",
    price: "$50",
    author: "Masum Billah",
    authorImage: "/assets/img/courses/author/1.png",
  },
  {
    category: "Python",
    image: "/assets/img/courses/4.jpg",
    rating: "(4.33 / 3 Rating)",
    title: "Learn Machine Learning Practically with Python",
    students: "3 Students",
    lessons: "14 Lessons",
    price: "$46",
    author: "Masum Billah",
    authorImage: "/assets/img/courses/author/1.png",
  },
];

export default function Courses3() {
  return (
    <section className="courses pt100">
      <div className="container">
        <div className="row">
          <div className="col-12 wow fadeInUp">
            <div className="section-title text-center">
              <span>Courses</span>
              <h2>Most Popular Courses</h2>

              <Image
                src="/assets/img/shapes/title.svg"
                alt=""
                width={216}
                height={20}
                className="d-inline-block"
              />
            </div>
          </div>
        </div>
        {/* End Col */}

      <div className="row gy-4 course_item">
        {courses.map((course, index) => (
          <div className="col-lg-6 col-12 wow fadeInUp" key={index}>
            <div className="single_course course_style5">
              <div className="row">
                <div className="col-xl-6 col-12">
                  <div className="course_img">
                    <div className="ccategory">
                      <Link href="#">{course.category}</Link>
                    </div>

                    <Image
                      src={course.image}
                      alt={course.title}
                      width={410}
                      height={300}
                    />
                  </div>
                </div>

                <div className="col-xl-6 col-12">
                  <div className="course_content">
                    <div className="crating_number">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-regular fa-star"></i>
                      <span>{course.rating}</span>
                    </div>

                    <h3>
                      <Link href="/course-details">{course.title}</Link>
                    </h3>

                    <div className="cmeta d-flex gap-4">
                      <div className="single_meta">
                        <i className="fa-regular fa-user"></i> {course.students}
                      </div>

                      <div className="single_meta">
                        <i className="fa-solid fa-book"></i> {course.lessons}
                      </div>
                    </div>

                    <div className="cbtm">
                      <div className="c_price float-start">
                        {course.price}
                      </div>

                      <div className="c_author float-end">
                        <Image
                          src={course.authorImage}
                          alt={course.author}
                          width={35}
                          height={35}
                          className="d-inline-block"
                        />

                        <Link href="#">{course.author}</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      </div>
    </section>
  );
}