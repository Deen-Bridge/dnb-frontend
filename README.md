# ✨ Deen Bridge: Connecting You to Islamic Knowledge 🕌

A modern platform empowering Muslims with authentic Islamic education through courses, books, spaces and mentorship.

## 🚀 Get Started: Setting Up Your Local Environment

Ready to dive into the Deen Bridge project? Follow these simple steps:

### ⬇️ Clone the Repository

```bash
git clone git@github.com:Deen-Bridge/dnb-frontend.git
cd dnb-frontend
```

### 🛠️ Installation

*   Install dependencies using `npm`:

```bash
npm install
```

*   Or, install dependencies using `yarn`:

```bash
yarn install
```

### ⚙️ Configuration

*   Create a `.env.local` file based on the `.env.example`
*   Set your environment variables:

```bash
NEXT_PUBLIC_API_URL=your_api_endpoint
```

### 🏃 Run the Development Server

*   Start the development server using `npm`:

```bash
npm run dev
```

*   Or, start the development server using `yarn`:

```bash
yarn dev
```

Your application should now be running on `http://localhost:3000`.

## 💡 Usage

### 📚 Exploring the Course Library

<details>
  <summary>Detailed Instructions</summary>
  
  1.  Navigate to the `/dashboard/courses` route.
  2.  Browse the available courses.
  3.  Click on a course to view its details.
  4.  Enroll and start learning!
  
  ![Course Library Screenshot](https://i.ibb.co/your_image_url.png)
  
  ```javascript
  // Example code snippet
  import CourseCard from '@/components/molecules/dashboard/cards/courseCard';

  const CoursesTab = () => {
    return (
      //...JSX Code
      <CourseCard key={course.id} course={course} />
      //...JSX Code
    );
  };
  ```
</details>

### 📖 Reading Books in the Library

<details>
  <summary>Step-by-Step Guide</summary>
  
  1.  Go to the `/dashboard/library` section.
  2.  Browse the available Islamic books.
  3.  Click on a book to start reading online or download it.
  
  ![Library Screenshot](https://i.ibb.co/your_image_url.png)
  
  ```javascript
  // Example code snippet
  import LibraryBookCard from '@/components/molecules/dashboard/cards/libraryCard';
  const BooksTab = () => {
   return (
      //...JSX Code
       <LibraryBookCard key={book.id} book={book} />
      //...JSX Code
    );
  };
  ```
</details>

## ✨ Key Features

*   **📚 Extensive Library**: Access a wide range of Islamic books and resources.
*   **🎓 Interactive Courses**: Enroll in courses covering various Islamic topics.
*   **💬 Community Spaces**: Connect with fellow learners in dedicated spaces.
*   **🧑‍🏫 Expert Mentorship**: Learn directly from experienced mentors.
*   **📱 Mobile-Friendly**: Enjoy a seamless experience on all devices.
*   **🔒 Secure Authentication**: Safe and secure user authentication.
*   **🎨 Customizable Profiles**: Personalize your learning journey.
*   **⭐ Stellar Payments**: Purchase courses and books with USDC on Stellar blockchain.
*   **👛 Wallet Integration**: Connect Freighter, xBull, or Albedo wallets for seamless payments.

## 🛠️ Technologies Used

| Technology         | Description                                                      | Link                               |
| :----------------- | :--------------------------------------------------------------- | :--------------------------------- |
| Next.js           | React framework for building performant web applications          | [https://nextjs.org/](https://nextjs.org/)          |
| JavaScript     | Programming language for web development.                         | [https://developer.mozilla.org/en-US/docs/Web/JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) |
| Tailwind CSS       | CSS framework for designing modern user interfaces                | [https://tailwindcss.com/](https://tailwindcss.com/)        |
| Radix UI          | Set of unstyled UI primitives for building accessible web apps     | [https://www.radix-ui.com/](https://www.radix-ui.com/)      |
| Zod               | TypeScript-first schema declaration with static type inference | [https://zod.dev/](https://zod.dev/)      |
| Axios          | Promise based HTTP client for the browser and node.js | [https://axios-http.com/](https://axios-http.com/)      |
| ESLint            | Tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. | [https://eslint.org/](https://eslint.org/)      |
| React Hook Form        | Performant, flexible and extensible forms with easy-to-use validation.  | [https://www.react-hook-form.com/](https://www.react-hook-form.com/)         |
| Sonner        |  An opinionated toast component for react. | [https://sonner.emilkowalski.com/](https://sonner.emilkowalski.com/)         |
| Stellar SDK   | Blockchain integration for payments | [https://stellar.org](https://stellar.org) |
| Stellar Wallets Kit | Multi-wallet support (Freighter, xBull, Albedo) | [https://github.com/AhaLabs/stellar-wallets-kit](https://github.com/creit-tech/stellar-wallets-kit) |

## 🤝 Contributing

We welcome contributions to the Deen Bridge project! Here’s how you can help:

*   🐛 **Report Bugs**: Submit detailed bug reports to help us improve stability.
*   ✨ **Suggest Features**: Propose new features to enhance the platform.
*   👨‍💻 **Submit Pull Requests**: Contribute code fixes and improvements.

Please follow these guidelines:

*   Follow the **coding conventions** used throughout the project.
*   Write **clear, concise, and well-documented code**.
*   Submit **pull requests** with detailed descriptions of the changes.
*   Be **respectful** and **collaborative** in discussions and code reviews.

## 🌊 Drips Wave

This repository participates in the **Stellar Drips Wave** bounty program. Contributors can earn rewards by completing issues tagged with Wave labels (`wave:1`, `wave:2`, `wave:3`, `wave:4`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to participate.

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🧑‍💻 Author Info

*   **Deen Bridge**
    *   [Website](https://deenbridge.com)
    *   [Twitter](Twitter placeholder)
    *   [GitHub](GitHub placeholder)
