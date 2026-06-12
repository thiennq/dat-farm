---
name: create-walkthrough
description: Quy trình tích hợp tự động quét log thô, sinh conversations.md và viết walkthrough.md có link neo chéo
---

# Kỹ năng Tạo nhật ký Walkthrough & Chat Log (create-walkthrough)

Kỹ năng này giúp AI Agent tự động hóa việc thu thập lịch sử chat (logs) thô của dự án từ thư mục dữ liệu của IDE, lọc bỏ các nội dung phụ, gán nhãn câu hỏi (ví dụ `#q1`, `#q2`), và tạo ra 2 định dạng đầu ra đồng bộ lưu trữ tại thư mục history:
1. **Chat Log sạch (`conversations.md`)**: Nhật ký hội thoại chi tiết với các Action thu gọn, lưu tại `<root>/history/chatlog/conversations.md`.
2. **Walkthrough (`history/walkthrough/XX.md`)**: Nhật ký hành trình tóm tắt, liên kết trực tiếp tới các neo câu hỏi trong Chat Log tương ứng (ví dụ: `#q1`, `#q2`).

## Phân định trách nhiệm (Separation of Concerns Rule)
* **Trách nhiệm của Kỹ năng (SOP của AI)**: Kỹ năng này tập trung hoàn toàn vào việc quét log thô, lọc và gán nhãn câu hỏi để xuất ra file chatlog sạch (`history/chatlog/conversations.md`), đồng thời tạo hoặc ghi tiếp vào tệp walkthrough tương ứng trong `<root>/history/walkthrough/`.
* **Trình bày giao diện (Dashboard/CLI)**: Việc hiển thị hoặc trình bày nội dung các file markdown này lên giao diện trực quan (ví dụ: dashboard web, CLI viewer, hoặc các dự án nguồn mở khác) là trách nhiệm của công cụ hiển thị bên ngoài và **hoàn toàn tách biệt** khỏi hoạt động của skill này. AI Agent không có trách nhiệm quản lý, đồng bộ hoặc sửa đổi các tệp cấu hình hiển thị trực tiếp trong thư mục `public/` như một phần của quy trình nghiệp vụ (SOP) của kỹ năng.

## Quy tắc kích hoạt (Trigger Rules)

AI Agent cần phân biệt giữa hai chế độ làm việc để quyết định có chủ động (proactively) sinh tài liệu hay không:

### 1. KHÔNG tự động chạy (Interactive Mode)
* **Kịch bản**: Phiên làm việc mang tính tương tác thường xuyên (người dùng hỏi đáp ngắn, sửa lỗi nhỏ, giải thích code, refactor cục bộ, hoặc lập trình viên đang trực tiếp đồng hành cùng AI từng bước).
* **Hành vi**: AI **KHÔNG** tự ý tạo file walkthrough ở cuối phiên làm việc. Hãy để người dùng chủ động gọi lệnh khi họ thấy cần thiết.

### 2. BẮT BUỘC tự động chạy như một "Biên bản bàn giao" (Proactive Handover Mode)
* **Kịch bản**: AI được giao việc ở chế độ tự trị cao (Autonomous) để xây dựng một tính năng mới hoặc thực hiện chuỗi công việc dài phức tạp.
* **Điều kiện kích hoạt tự động**: AI tự động chạy quy trình tạo Walkthrough ở cuối phiên khi thỏa mãn một trong các tiêu chí sau:
  1. Người dùng bắt đầu phiên làm việc bằng lệnh `/goal` (chạy dài hạn tự giải quyết mục tiêu lớn).
  2. AI thực hiện một file task lớn từ `tasks/backlog/` và tự mình hoàn thành liên tục từ $\ge 3$ checklist items trở lên mà không cần người dùng can thiệp sửa code giữa chừng.
  3. Phiên làm việc tạo ra thay đổi lớn trên codebase (sửa đổi $\ge 5$ files hoặc tạo mới hoàn toàn cấu trúc một thư mục module/thư mục kỹ năng mới).

## Quy tắc Ghi tiếp & Ghép nối Walkthrough (Append & Merge Rules)

Để tránh tình trạng tạo ra quá nhiều tệp Walkthrough nhỏ lẻ trong một ngày làm việc (ví dụ chạy nhiều tasks phụ sinh ra hàng chục file nhỏ), AI phải áp dụng quy tắc thông minh sau khi sinh tài liệu:

### 1. Quy tắc Đánh giá và Ghi tiếp (Append to Last File)
Trước khi tạo một file Walkthrough mới (`XX.md`), AI Agent **bắt buộc phải đọc file Walkthrough cuối cùng hiện có** trong thư mục `<root>/history/walkthrough/` (ví dụ `04.md`):
* **Tiêu chí ưu tiên ghi tiếp (Append)**: AI sẽ ghi tiếp các Phase mới vào file cuối cùng nếu thỏa mãn **ít nhất một** trong các điều kiện sau:
  - **Cùng Ngày (Same Date)**: Ngày tạo tệp cuối cùng (`date` trong frontmatter) trùng với ngày hiện tại.
  - **Cùng Mục tiêu lớn (Same Epic/Feature)**: Nội dung của session hiện tại liên quan trực tiếp hoặc tiếp nối mục tiêu (`goal` hoặc `title`) của tệp cuối cùng.
  - **Dưới 3 Phase**: Tệp cuối cùng mới chỉ có dưới 3 Phase (kể cả khác ngày nhưng trong vòng 48 giờ qua) $\rightarrow$ ưu tiên ghi tiếp để gom cụm nội dung.
* **Cách thực hiện Ghi tiếp (Append)**:
  - Giữ nguyên YAML frontmatter của tệp cũ (có thể cập nhật thêm mô tả vào trường `goal` nếu phạm vi công việc mở rộng).
  - Cập nhật **Mục lục** ở đầu tệp để thêm liên kết đến Phase mới.
  - Chèn nội dung Phase mới (`## Phase X: ...`) ngay trước phần `## 💡 Lessons Learned` của tệp cũ.
  - Tổng hợp, gộp các bài học kinh nghiệm mới vào phần `## 💡 Lessons Learned`.
  - Cập nhật lại phần `## 📊 Kết quả & Thống kê` ở cuối tệp (cộng dồn số lượng files changed, commits, và checklist tasks đã hoàn thành).

## Hướng dẫn Quy trình Thực hiện

Khi được yêu cầu viết Walkthrough hoặc cập nhật tài liệu, thực hiện theo quy trình bắt buộc sau:

### Bước 1: Sinh dữ liệu Chat Log Hybrid (Tự động)
Chạy script Python `build-history.py` trong thư mục `scripts/` để quét logs từ IDE, gán nhãn và xuất ra tệp `conversations.md`:
```bash
python3 wip/skill-create-walkthrough/scripts/build-history.py
```
*Tệp kết quả gốc sẽ được ghi vào `history/chatlog/conversations.md`.*

### Bước 2: Viết/Cập nhật tóm tắt hành trình (Walkthrough)
1. Đọc tệp `history/chatlog/conversations.md` kết hợp với `git log` để viết tóm tắt.
2. Áp dụng **Quy tắc Ghi tiếp**: Đọc file cuối trong `history/walkthrough/` để quyết định append hay tạo file mới.
3. Chèn liên kết neo dẫn sang Chat Log: Tại đầu mỗi Phase trong tệp Walkthrough, chèn link neo dẫn thẳng sang phần hội thoại chi tiết tương ứng (ví dụ: `[Xem chi tiết cuộc đối thoại của Phase này](../../history/chatlog/conversations.md#q3)`).
4. **Giữ nguyên văn bản gốc của Prompt**: Tại mục `### Prompt` của mỗi Phase, AI **bắt buộc phải copy chính xác 100% nội dung câu hỏi gốc (raw text)** do người dùng nhập từ `conversations.md`. Không được phép tự ý tóm tắt, viết lại, biên tập (makeup) hoặc gom nhóm các prompt khác nhau thành một danh sách tự tạo. Nếu Phase đó bao gồm nhiều lượt yêu cầu của người dùng, hãy liệt kê chúng rõ ràng thành `### Prompt 1`, `### Prompt 2`... kèm theo các link neo chéo tương ứng.

