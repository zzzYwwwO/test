import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-phone-verify',
  templateUrl: './phone-verify.component.html',
  styleUrls: ['./phone-verify.component.css'],
})
export class PhoneVerifyComponent implements OnInit {
  phoneForm: FormGroup;
  isLoading = false;
  error = '';
  username = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // 从sessionStorage获取用户名
    this.username = sessionStorage.getItem('username') || '';

    this.phoneForm = this.fb.group({
      username: [{ value: this.username, disabled: true }],
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
    });
  }

  verifyPhone() {
    if (this.phoneForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const apiRoot = environment.apiRoot;

    this.http
      .post(`${apiRoot}/auth/verify-phone`, {
        username: this.username,
        phone: this.phoneForm.value.phone,
      })
      .subscribe(
        () => {
          // 验证成功，设置登录状态
          sessionStorage.setItem('isAuthenticated', 'true');
          // 刷新页面以加载主应用
          window.location.reload();
        },
        (err) => {
          this.error = err.error || 'Verification failed';
          this.isLoading = false;
        }
      );
  }
}
