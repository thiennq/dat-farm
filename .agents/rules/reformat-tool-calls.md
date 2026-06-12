# Quy tắc Định dạng Tool Call trong Nhật ký (Reformat Tool Calls Rule)

## Bối cảnh (Context)
Khi viết mới hoặc chỉnh sửa tệp nhật ký `chatlog.md` hoặc các tệp báo cáo kỹ thuật liên quan, toàn bộ thông tin cuộc gọi công cụ (tool calls) của AI phải được định dạng rút gọn, sạch sẽ và thống nhất.

## Quy tắc Chung (General Rules)
1.  **Loại bỏ tiền tố**: Tuyệt đối không dùng tiền tố `Call tool ` trước tên công cụ. Chỉ viết tên công cụ trong dấu backtick: `- `tên_công_cụ``.
2.  **Tránh escape dấu ngoặc kép**: Không escape ký tự `\"` bên trong dấu backtick. Sử dụng dấu ngoặc kép `"` thuần túy (ví dụ: `"Sprout Lands"` thay vì `\"Sprout Lands\"`).
3.  **Ẩn cấu trúc thư mục cục bộ (Hiding folder structure)**: Tuyệt đối không để lộ đường dẫn tuyệt đối trên máy của User (ví dụ: `/Users/thiennq/workspace/personal/farm/...`). Mọi đường dẫn trong tệp log phải được rút gọn tương đối hoặc thay bằng tên thư mục gốc của dự án: `farm/...`.
    *   *Ví dụ*: Sửa `- `view_file`: `/Users/thiennq/workspace/personal/farm/vite.config.js`` thành `- `view_file`: `farm/vite.config.js``.

---

## Định dạng với Từng Tool Cụ thể (Specific Tool Formats)

### 1. `list_dir`
*   **Cú pháp**: `- `list_dir`: `DirectoryPath``
*   **Ví dụ**: `- `list_dir`: `farm``

### 2. `view_file`
*   **Cú pháp**: `- `view_file`: `FilePath``
*   **Ví dụ**: `- `view_file`: `farm/vite.config.js``

### 3. `write_to_file`
*   **Cú pháp**: `- `write_to_file`: `FilePath``
*   **Ví dụ**: `- `write_to_file`: `farm/tasks/backlog/task.md``

### 4. `run_command`
*   **Cú pháp**: `- `run_command`: `CommandString``
*   **Ví dụ**: `- `run_command`: `npm run build``

### 5. `search_web`
*   **Cú pháp**: `- `search_web` {query: `QueryString`, toolSummary: `SummaryString`}`
*   **Ví dụ**: `- `search_web` {query: `"Sprout Lands" github site:github.com`, toolSummary: `Search Sprout Lands GitHub`}`

### 6. `ask_question`
*   **Cú pháp**: Trình bày trực quan thành danh sách thụt lề có thứ tự (A, B, C...) thay vì hiển thị JSON thô.
*   **Cấu trúc**:
    ```markdown
    - `ask_question` :
      - **Câu hỏi <Số>**: <Nội dung câu hỏi>
        - **A.** (Recommended) <Lựa chọn khuyến nghị>
        - **B.** <Lựa chọn B>
      - **Câu hỏi <Số> (Multiple)**: <Nội dung câu hỏi chọn nhiều>
        - **A.** <Lựa chọn A>
        - **B.** <Lựa chọn B>
    ```
*   **Ví dụ thực tế**:
    ```markdown
    - `ask_question` :
      - **Câu hỏi 1**: Công nghệ/Framework nào bạn muốn sử dụng?
        - **A.** (Recommended) Vite + Vanilla JS & HTML5 Canvas
        - **B.** Vite + Phaser JS
      - **Câu hỏi 2 (Multiple)**: Những hoạt cảnh nào bạn muốn có?
        - **A.** Nhân vật đi lại
        - **B.** Cây trồng lớn dần
    ```
