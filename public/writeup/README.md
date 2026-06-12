# Tài liệu Kỹ thuật Trang Writeup Dashboard

Tài liệu này thuyết minh về các công nghệ, cấu trúc tệp tin và cơ chế hoạt động của trang **Writeup Dashboard** (Trình đọc báo cáo và lịch sử chat dự án).

---

## 1. Công nghệ Sử dụng (Technology Stack)

Trang Dashboard được xây dựng dựa trên triết lý **tối giản, gọn nhẹ và không phụ thuộc vào framework nặng nề (Vanilla/No-build)**:

*   **HTML5 & CSS3**:
    *   Sử dụng Flexbox và CSS Grid cho bố cục 2 cột linh hoạt.
    *   Hệ thống biến CSS (variables) để quản lý màu sắc đồng bộ (Emerald Dark Theme).
    *   Hiệu ứng Glassmorphism (phông nền mờ ảo) sử dụng `backdrop-filter: blur()`.
    *   CSS Selector `:has()` hiện đại để ẩn/hiện và tối ưu không gian Topbar trên thiết bị di động dựa trên trạng thái của phần tử con.
*   **Vanilla Javascript (ES6+)**:
    *   Quản lý trạng thái ứng dụng cục bộ, xử lý bất đồng bộ tải tệp tin (`fetch`).
    *   Cơ chế dựng DOM động cho cây thư mục tập tin (File Tree).
    *   Scrollspy tùy chỉnh và bộ định tuyến URL Hash (`history.replaceState`) đồng bộ trạng thái thanh địa chỉ khi người dùng cuộn.
*   **Marked.js (CDN)**:
    *   Thư viện phân tích cú pháp Markdown sang HTML chạy trực tiếp trên trình duyệt Client-Side. Hiệu suất cao, giúp hiển thị trực quan các tệp `.md`.
*   **Highlight.js (CDN)**:
    *   Tự động phát hiện ngôn ngữ lập trình và tô màu cú pháp (syntax highlighting) cho các khối code block.
    *   Sử dụng theme màu tối cao cấp (GitHub Dark Theme).
*   **Typography (Google Fonts)**:
    *   Phông chữ chính: `Outfit` (sans-serif) sang trọng và hiện đại.
    *   Phông chữ code block: `JetBrains Mono` tối ưu hóa cho hiển thị mã nguồn và nhật ký terminal.

---

## 2. Cấu trúc Thư mục & Tệp tin (File Structure)

Thư mục Writeup nằm trong thư mục `public/` tĩnh của dự án để Vite sao chép trực tiếp vào thư mục phân phối `dist/`:

```text
public/writeup/
├── md/
│   ├── chatlog.md         # Bản ghi nhật ký hội thoại đã tối ưu hóa định dạng
│   └── tasks/
│       └── done/          # Các tệp backlog nhiệm vụ đã hoàn thành
│           ├── 2026-06-12-01-setup-project-and-assets.md
│           ├── 2026-06-12-02-create-tilemap-and-player.md
│           └── 2026-06-12-03-add-farm-animals-animations.md
├── index.html             # Tệp cấu trúc giao diện HTML chính
├── style.css              # Tệp định nghĩa kiểu giao diện và Responsive Mobile
├── script.js              # Tệp điều khiển cây thư mục, fetch file và Timeline Scrollspy
└── README.md              # Tệp tài liệu thuyết minh kỹ thuật này
```

---

## 3. Các Cơ chế Hoạt động Chính

### A. Dựng Cây Thư mục & Tải Nội dung Động
1.  Cấu trúc thư mục được định nghĩa bằng một mảng JSON `fileTreeData` trong `script.js`.
2.  Khi tải trang, hàm `createTreeDOM` sẽ duyệt mảng này để dựng nên các node thư mục/tập tin HTML.
3.  Khi click vào một node tập tin, sự kiện click sẽ kích hoạt hàm `loadFileContent()`. Hàm này dùng `fetch` API để tải bất đồng bộ tệp Markdown tương ứng.

### B. Bóc tách YAML Frontmatter
Các tệp nhiệm vụ hoàn thành có phần Frontmatter chứa thông tin metadata (như `title`, `date`, `status`, `goal`).
Hàm `loadFileContent()` sử dụng Regex để bóc tách phần này:
```javascript
const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
```
Sau đó, parse các cặp khóa-giá trị này thành giao diện trực quan đặt trong `.metadata-card` ở đầu nội dung hiển thị trước khi chuyển phần Markdown còn lại cho `marked.js` biên dịch.

### C. Thu gọn Lượt chat của AI (Collapsible Antigravity Turns)
Đối với tệp `chatlog.md`, hàm `makeSectionsCollapsible()` sẽ tự động:
1.  Tìm các thẻ tiêu đề `<h2>` đại diện cho phản hồi của AI (`Antigravity`).
2.  Nhóm toàn bộ các thẻ nội dung nằm bên dưới (cho đến khi gặp thẻ tiêu đề `<h2>` tiếp theo) vào một khối `.collapsible-section`.
3.  Thêm icon nút bấm thu gọn/mở rộng `▾` / `▸` vào tiêu đề để người đọc dễ dàng đóng mở nhanh các phần giải trình dài của AI.

### D. Đồng bộ Dòng thời gian và Scrollspy
1.  **Xây dựng Timeline**: Quét tất cả thẻ tiêu đề `<h2>` chứa chữ `User` để trích xuất số lượng lượt hỏi, tạo ra chuỗi liên kết `(1)--(2)--(3)...` tương ứng.
2.  **Định vị Cuộn chính xác**: Sử dụng công thức tọa độ tương quan thông qua `getBoundingClientRect()` để cuộn tới đúng vị trí tiêu đề User cách mép Topbar cố định `20px`.
3.  **Scrollspy tối ưu**: Lắng nghe sự kiện cuộn của cửa sổ đọc, so khớp vị trí cuộn hiện tại với danh sách tọa độ các câu hỏi đã được tính toán trước (`questionOffsets`) để thay đổi màu hạt active trên Topbar và thay đổi liên kết băm (`#q1`, `#q2`...) mà không gây giật lag trang.

---

## 4. Cách Vận hành và Chạy Thử (Running Local)

*   **Chạy Development Server**: Chạy lệnh `npm run dev` ở thư mục gốc của dự án. Truy cập liên kết: `http://localhost:5173/writeup/index.html`.
*   **Build Production**: Chạy lệnh `npm run build` để đóng gói. Các tệp tin trong thư mục `public/writeup/` sẽ được Vite copy tự động sang `dist/writeup/`.
