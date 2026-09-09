<?php
/**
 * Обробка форми зворотного зв’язку та відправка листа.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Дозволений лише метод POST.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$name    = isset($_POST['name']) ? trim((string) $_POST['name']) : '';
$email   = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
$message = isset($_POST['message']) ? trim((string) $_POST['message']) : '';

if ($email === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'field'   => 'email',
        'message' => 'Будь ласка, вкажіть Email — це обов’язкове поле.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'field'   => 'email',
        'message' => 'Вкажіть коректну адресу Email (наприклад, name@example.com).',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$to      = '6weeks.13h@gmail.com';
$subject = '6weeks - Форма заповнена';

$bodyLines = [
    'Отримано нові дані з форми:',
    '',
    'Ім’я: ' . ($name !== '' ? $name : '(не вказано)'),
    'Email: ' . $email,
    'Текстове поле: ' . ($message !== '' ? $message : '(не вказано)'),
    '',
    'Дата: ' . date('Y-m-d H:i:s'),
];

$body = implode("\r\n", $bodyLines);

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: 6weeks Form <noreply@html.local>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Не вдалося надіслати лист. Перевірте налаштування пошти в Open Server.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Дякуємо! Дані форми надіслано на 6weeks.13h@gmail.com.',
], JSON_UNESCAPED_UNICODE);
