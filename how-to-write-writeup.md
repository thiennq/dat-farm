# Hướng dẫn Xây dựng Trang Nhật ký & Báo cáo (Writeup Dashboard)

Tài liệu này tổng hợp toàn bộ kinh nghiệm, quy chuẩn thiết kế, định dạng log và giải pháp kỹ thuật đã triển khai trong quá trình phát triển trang Dashboard Báo cáo cho dự án Nông trại.

---

## 1. Thiết kế Giao diện (UI/UX)

### Cấu trúc Giao diện 2 Cột (Responsive)
*   **Sidebar (Cột trái)**: 
    *   Hiển thị cây thư mục duyệt các tệp tin log (`chatlog.md`) và tệp nhiệm vụ hoàn thành (`tasks/done/...`).
    *   Mặc định mở rộng (expanded) toàn bộ các cấp thư mục con để người dùng dễ quan sát.
    *   **Mobile**: Ẩn sidebar theo mặc định, hiển thị nút Hamburger (☰) ở góc trái thanh Topbar để trượt mở dạng ngăn kéo (drawer) kèm lớp nền mờ (backdrop blur). Tự động đóng sidebar khi người dùng chọn xong tệp tin.
*   **Main Content (Cột phải)**:
    *   **Topbar**: Cố định phía trên, chứa tiêu đề đường dẫn file đang đọc và **Thanh Tiến trình Timeline** `(1)--(2)--(3)...` tương ứng với số câu hỏi của User.
    *   **Viewer Pane**: Khung hiển thị nội dung tài liệu (Markdown parsed to HTML) có thanh cuộn riêng, áp dụng giao diện tối (Dark Mode), hiệu ứng Glassmorphism nhẹ nhàng và phông chữ Outfit sang trọng.

---

## 2. Quy chuẩn Định dạng Tệp Nhật ký (Chatlog)

Để tệp log sạch sẽ, trực quan và dễ đọc, cấu trúc nội dung cần tuân thủ nghiêm ngặt các quy tắc sau:

### Tối giản hóa và Loại bỏ Rác Log
*   **Bỏ tiền tố thừa**: Loại bỏ cụm từ `Call tool ` trước mỗi lần gọi công cụ. Chỉ hiển thị tên công cụ trong dấu backtick (ví dụ: `- `search_web`...`).
*   **Rút gọn đối số**: Các công cụ có một đối số chính (`list_dir`, `view_file`, `write_to_file`, `run_command`) được định dạng gọn nhẹ theo cú pháp:
    ```markdown
    - `toolName`: `mainParameter`
    ```
*   **Không escape ký tự**: Vì tham số đã đặt trong dấu backtick của JSON giả định `{query: `string`}` nên các dấu ngoặc kép bên trong chuỗi tuyệt đối không cần escape `\"` thành `"` nữa.
*   **Gộp hành động**: Các khối hành động (`Action`), suy nghĩ (`Thinking`) hoặc phản hồi (`Response`) của AI xuất hiện liên tiếp trong cùng một lượt chat phải được gộp chung dưới một nhóm tiêu đề duy nhất.
*   **Loại bỏ bước trùng lặp**: Lượt chat thực thi kế tiếp không được lặp lại các bước khảo sát/lập kế hoạch đã làm ở lượt trước (như trong trường hợp phân tách Q4 và Q5).

### Định dạng Trực quan cho Câu hỏi Tương tác (`ask_question`)
Thay vì hiển thị dạng JSON thô, các câu hỏi trắc nghiệm phức tạp phải được bóc tách thành dạng danh sách phân cấp dễ đọc:
```markdown
- `ask_question`:
  - **Câu hỏi 1 (Multiple)**: Tiêu đề câu hỏi chọn nhiều
    - **A.** Lựa chọn A
    - **B.** Lựa chọn B
  - **Câu hỏi 2**: Tiêu đề câu hỏi chọn một
    - **A.** (Recommended) Lựa chọn A khuyến nghị
    - **B.** Lựa chọn B
```

---

## 3. Các Giải pháp Kỹ thuật Frontend Cốt lõi

### Nạp & Parse Markdown động trên Client-Side
*   Sử dụng thư viện `marked.js` để chuyển đổi nội dung tệp `.md` được tải về (`fetch`) sang HTML.
*   Tích hợp `highlight.js` để tự động tô màu cú pháp (syntax highlighting) cho các khối code block.
*   Nhận diện và phân tách phần YAML Frontmatter để render thành một tấm thẻ thông tin (`metadata-card`) gọn gàng ở đầu trang.

### Cơ chế Timeline & Scrollspy Đồng bộ URL Hash
*   **Đếm câu hỏi**: Quét tất cả thẻ tiêu đề `<h2>👤 User</h2>` để tạo ra số lượng nút tương ứng trên thanh timeline `(1)--(2)...`.
*   **Cuộn mượt (Smooth Scroll) không bị che tiêu đề**:
    *   Do thanh Topbar chiếm chiều cao cố định, việc tính toán cuộn phải sử dụng tọa độ tương quan thông qua `getBoundingClientRect()` thay vì `offsetTop` thông thường:
        ```javascript
        const relativeTop = targetEl.getBoundingClientRect().top - viewerPane.getBoundingClientRect().top + viewerPane.scrollTop;
        const topOffset = relativeTop - 20; // Chừa khoảng đệm 20px dưới Topbar
        ```
*   **Scrollspy hiệu năng cao**:
    *   Tính toán trước (pre-compute) tọa độ các thẻ tiêu đề khi tải trang hoặc khi thay đổi kích thước cửa sổ (`resize`) để tránh hiện tượng nghẽn luồng render (layout thrashing) khi cuộn.
    *   Khi người dùng cuộn, tự động highlight hạt timeline tương ứng và thay đổi mã băm địa chỉ URL (`#q1`, `#q2`...) bằng `history.replaceState`.
    *   Nếu cuộn về sát đỉnh trang (`scrollTop < 15px`), tự động làm sạch URL (xóa ký tự băm `#`) và đưa highlight về hạt số `1`.
    *   **Không tự động cuộn khi mở tệp**: Đảm bảo tệp tin luôn mở ở đỉnh trang đầu tiên, chỉ cập nhật URL băm khi người dùng thực hiện cuộn thủ công hoặc bấm nút timeline.

### Tối ưu hóa Hiển thị Di động (Mobile Optimization)
*   **Topbar thu hẹp**: Đặt `gap: 0` và `padding: 0` trên mobile để tối ưu hóa tối đa chiều ngang.
*   **Ẩn đường dẫn**: Ẩn nhãn đường dẫn tệp tin `.current-path` trên mobile khi thanh timeline đang hiển thị để nhường chỗ cho các hạt nút bấm.
*   **Thu nhỏ đường nối**: Giảm chiều rộng của đường nối giữa các hạt timeline (`.timeline-line`) xuống còn `3px`.
*   **Tránh tràn khung**: Đặt thuộc tính `.timeline-container { justify-content: flex-start; }` trên mobile để các nút bấm dồn về bên trái và cuộn ngang bình thường khi số lượng câu hỏi vượt quá chiều rộng màn hình (tránh việc dùng `center` gây mất hạt số 1 bên ngoài tầm cuộn).

---

## 4. Quy trình Biên dịch & Triển khai (Deployment)

*   **Nguyên tắc Bắt buộc**: **Luôn kiểm thử cục bộ (Test Local)** thông qua dev server trước khi đẩy code lên môi trường deploy từ xa.
*   **Khắc phục lỗi nạp file tĩnh (GitHub Pages 404)**:
    *   Do GitHub Pages mặc định sử dụng trình biên dịch Jekyll, nó sẽ chặn việc fetch các file tĩnh bắt đầu bằng dấu gạch dưới (như các thư mục con trong hệ thống).
    *   **Giải pháp**: Luôn tạo một tệp tin trống tên `.nojekyll` đặt ở thư mục gốc của sản phẩm build (`dist/`) để bỏ qua Jekyll.
