---
title: Angular
tags: [angular, typescript, framework, frontend, enterprise, google, rxjs]
---

# Angular

Angular is a comprehensive, opinionated framework for building web applications. Developed and maintained by Google, Angular (version 2+, not to be confused with AngularJS/Angular 1) is built with [TypeScript](/content/languages/typescript) from the ground up and provides everything you need for enterprise-scale applications: routing, forms, HTTP client, state management, and more.

## What is Angular?

Angular is a **full framework** with strong opinions and built-in solutions:

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button (click)="increment()">Increment</button>
  `,
  styles: [`
    h1 {
      color: #dd0031;
    }
  `]
})
export class AppComponent {
  title = 'My Angular App';
  count = 0;

  increment() {
    this.count++;
  }
}
```

**Key Philosophy:**
- **Opinionated**: One way to do things
- **Batteries included**: Everything built-in
- **TypeScript-first**: Not optional, it's core
- **Enterprise-ready**: Built for large teams and long-term projects

## Why Angular?

### 1. Complete Solution

Unlike [React](/content/frameworks/react) which requires choosing libraries, Angular includes everything:

- **Routing**: `@angular/router`
- **Forms**: `@angular/forms` (template-driven and reactive)
- **HTTP**: `@angular/common/http`
- **Animations**: `@angular/animations`
- **Testing**: Built-in testing tools
- **CLI**: Powerful command-line interface

### 2. TypeScript-First

Angular is built with [TypeScript](/content/languages/typescript) and designed around it:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      <li *ngFor="let user of users">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  `
})
export class UserListComponent {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers()
      .subscribe(users => this.users = users);
  }
}
```

### 3. Dependency Injection

Built-in dependency injection makes code testable:

```typescript
// user.service.ts
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// user-list.component.ts
export class UserListComponent {
  // Service automatically injected
  constructor(private userService: UserService) {}
}
```

### 4. RxJS for Reactive Programming

Angular uses RxJS Observables throughout:

```typescript
@Component({
  selector: 'app-search',
  template: `
    <input (input)="search($event)" />
    <ul>
      <li *ngFor="let result of results$ | async">
        {{ result.name }}
      </li>
    </ul>
  `
})
export class SearchComponent {
  searchTerms = new Subject<string>();
  results$: Observable<SearchResult[]>;

  constructor(private searchService: SearchService) {
    this.results$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchService.search(term))
    );
  }

  search(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerms.next(term);
  }
}
```

### 5. Strong Convention

Angular enforces conventions that help large teams:

```
src/
  app/
    components/
      user-list/
        user-list.component.ts
        user-list.component.html
        user-list.component.css
        user-list.component.spec.ts
    services/
      user.service.ts
      user.service.spec.ts
    models/
      user.model.ts
```

## Components

### Component Decorator

```typescript
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() user: User;
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {
    console.log('Component initialized');
  }

  handleDelete(): void {
    this.delete.emit(this.user.id);
  }
}
```

### Template

```html
<!-- user-card.component.html -->
<div class="card">
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
  <button (click)="handleDelete()">Delete</button>
</div>
```

## Template Syntax

### Directives

```html
<!-- Structural directives -->
<div *ngIf="isVisible">Visible</div>

<ul>
  <li *ngFor="let item of items; let i = index">
    {{ i }}: {{ item.name }}
  </li>
</ul>

<div [ngSwitch]="status">
  <p *ngSwitchCase="'loading'">Loading...</p>
  <p *ngSwitchCase="'error'">Error!</p>
  <p *ngSwitchDefault>Ready</p>
</div>

<!-- Attribute directives -->
<div [ngClass]="{ active: isActive, disabled: isDisabled }">
  Content
</div>

<div [ngStyle]="{ color: textColor, fontSize: size + 'px' }">
  Styled text
</div>
```

### Property and Event Binding

```html
<!-- Property binding -->
<img [src]="imageUrl" [alt]="imageAlt" />
<button [disabled]="isDisabled">Click</button>

<!-- Event binding -->
<button (click)="handleClick()">Click</button>
<input (input)="handleInput($event)" />

<!-- Two-way binding -->
<input [(ngModel)]="username" />
```

## Forms

### Template-Driven Forms

```typescript
@Component({
  selector: 'app-contact',
  template: `
    <form #contactForm="ngForm" (ngSubmit)="onSubmit(contactForm)">
      <input
        name="name"
        [(ngModel)]="model.name"
        required
        #name="ngModel"
      />
      <div *ngIf="name.invalid && name.touched">
        Name is required
      </div>

      <input
        type="email"
        name="email"
        [(ngModel)]="model.email"
        required
        email
      />

      <button [disabled]="contactForm.invalid">Submit</button>
    </form>
  `
})
export class ContactComponent {
  model = {
    name: '',
    email: ''
  };

  onSubmit(form: NgForm): void {
    console.log(form.value);
  }
}
```

### Reactive Forms

```typescript
@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      <div *ngIf="email.invalid && email.touched">
        <div *ngIf="email.errors?.['required']">Email is required</div>
        <div *ngIf="email.errors?.['email']">Invalid email</div>
      </div>

      <input type="password" formControlName="password" />

      <button [disabled]="loginForm.invalid">Login</button>
    </form>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    }
  }
}
```

## Services

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}`);
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }
}
```

## Routing

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'users/:id', component: UserDetailComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  // Lazy loading
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module')
      .then(m => m.DashboardModule)
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

**Using routes:**
```html
<!-- Navigation -->
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/about">About</a>
  <a [routerLink]="['/users', userId]">User</a>
</nav>

<!-- Router outlet -->
<router-outlet></router-outlet>
```

**Accessing route params:**
```typescript
export class UserDetailComponent implements OnInit {
  user$: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user$ = this.route.params.pipe(
      switchMap(params => this.userService.getUser(params['id']))
    );
  }
}
```

## Lifecycle Hooks

```typescript
export class MyComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Input changed', changes);
  }

  ngOnInit(): void {
    console.log('Component initialized');
    // Fetch data, set up subscriptions
  }

  ngOnDestroy(): void {
    console.log('Component destroyed');
    // Clean up subscriptions
  }
}
```

**Common hooks:**
- `ngOnChanges`: After input property changes
- `ngOnInit`: After first `ngOnChanges`
- `ngDoCheck`: During every change detection run
- `ngAfterContentInit`: After content projection
- `ngAfterViewInit`: After view initialization
- `ngOnDestroy`: Before component destruction

## State Management

### Services (Simple)

```typescript
@Injectable({
  providedIn: 'root'
})
export class StateService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  setUser(user: User): void {
    this.userSubject.next(user);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
```

### NgRx (Complex)

For large applications, Angular uses NgRx (Redux pattern):

```typescript
// State
export interface AppState {
  users: User[];
  loading: boolean;
}

// Actions
export const loadUsers = createAction('[User List] Load Users');
export const loadUsersSuccess = createAction(
  '[User List] Load Users Success',
  props<{ users: User[] }>()
);

// Reducer
export const userReducer = createReducer(
  initialState,
  on(loadUsers, state => ({ ...state, loading: true })),
  on(loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false
  }))
);

// Component
export class UserListComponent {
  users$ = this.store.select(state => state.users);

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }
}
```

## Angular CLI

Powerful command-line interface:

```bash
# Create new app
ng new my-app

# Generate components
ng generate component user-list
ng g c user-detail --skip-tests

# Generate services
ng generate service user
ng g s auth

# Generate modules
ng generate module admin --routing
ng g m shared

# Serve app
ng serve

# Build for production
ng build --prod

# Run tests
ng test

# Run e2e tests
ng e2e
```

## Standalone Components (Angular 14+)

New simpler approach without NgModules:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-user-card',
  template: `
    <div class="card">
      <h2>{{ user.name }}</h2>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;
}
```

## Angular vs Alternatives

| Feature | Angular | [React](/content/frameworks/react) | [Vue](/content/frameworks/vue) |
|---------|---------|-------|-----|
| **Type** | Full framework | Library | Framework |
| **Learning Curve** | Steep | Moderate | Gentle |
| **TypeScript** | Required | Optional | Optional |
| **Boilerplate** | High | Low | Low |
| **Opinions** | Strong | Minimal | Moderate |
| **Size** | Large (~90KB) | Medium (~45KB) | Medium (~40KB) |
| **Best For** | Enterprise | Flexible apps | Versatile apps |

## Styling

### Component Styles

```typescript
@Component({
  selector: 'app-button',
  template: `<button>Click me</button>`,
  styles: [`
    button {
      background: blue;
      color: white;
      padding: 10px 20px;
    }
  `]
})
export class ButtonComponent {}
```

### [Tailwind CSS](/content/css/tailwind)

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Angular Material

Official Material Design component library:

```bash
ng add @angular/material
```

```typescript
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatButtonModule],
  template: `<button mat-raised-button color="primary">Click</button>`
})
export class MyComponent {}
```

## When to Use Angular

**Perfect for:**
- Large enterprise applications
- Teams that want structure and conventions
- Long-term projects with multiple developers
- Projects requiring consistency
- TypeScript-first development

**Not ideal for:**
- Small projects (too much overhead)
- Rapid prototyping (too opinionated)
- Teams unfamiliar with TypeScript or RxJS
- Projects requiring minimal bundle size

## Best Practices

### 1. Use OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {}
```

### 2. Unsubscribe from Observables

```typescript
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Use Async Pipe

```typescript
// ✓ Good - automatic subscription management
@Component({
  template: `<div>{{ data$ | async }}</div>`
})
export class MyComponent {
  data$ = this.service.getData();
}

// ❌ Bad - manual subscription
export class MyComponent {
  data: any;

  ngOnInit() {
    this.service.getData().subscribe(data => this.data = data);
  }
}
```

## Learning Resources

### Official Resources
- **Angular Documentation**: [angular.io/docs](https://angular.io/docs)
- **Angular Tutorial**: Tour of Heroes
- **Angular CLI**: [angular.io/cli](https://angular.io/cli)
- **Angular Blog**: Official updates

### Community
- **Angular Discord**: Active community
- **r/Angular2**: Reddit community
- **AngularAir**: Podcast
- **Angular Conferences**: ng-conf, AngularConnect

### Courses
- **Angular - The Complete Guide** - Maximilian Schwarzmüller
- **Angular for Beginners** - Angular University
- **Angular Material** - Angular University
- **NgRx Complete Guide** - Angular University

## Key Takeaways

- **Full framework** with everything included
- **TypeScript-first** development
- **Opinionated** structure and conventions
- **RxJS** for reactive programming
- **Dependency injection** built-in
- **Enterprise-ready** for large teams
- **Steep learning curve** but consistent patterns
- **Best for** long-term, large-scale applications

## Related Topics

- [React](/content/frameworks/react) - Compare component approaches
- [Vue](/content/frameworks/vue) - Less opinionated alternative
- [TypeScript](/content/languages/typescript) - Required for Angular
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Framework comparison
- [Tailwind CSS](/content/css/tailwind) - Modern styling approach
- [Svelte](/content/frameworks/svelte) - Simpler alternative

Angular is the most opinionated of the major frameworks, which is both its strength and weakness. For large organizations with multiple teams working on long-term projects, Angular's structure, conventions, and completeness make it an excellent choice. The steep learning curve pays off with consistency, maintainability, and a clear path forward for enterprise applications.
