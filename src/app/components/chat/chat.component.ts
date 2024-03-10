import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

class Message {
  text?: string;
  type: MessageType;
}

enum MessageType {
  Bot = 'bot',
  User = 'user',
  Loading = 'loading'
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer: ElementRef;
  @Input() public display: string;

  public form: UntypedFormGroup;
  public messages: Array<Message> = [];
  private canSendMessage = true;

  constructor(private formBuilder: UntypedFormBuilder){}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      message: ['']
    });
    this.getBotMessage();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  public async onClickSendMessage(): Promise<void> {
    const message = this.form.get('message').value;

        const response = await fetch("http://localhost:8080/searchInput", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        "prompt": message,
        "temperature": 0.5,
        "max_tokens": 50,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
      }), // body data type must match "Content-Type" header
    });
    const movies = await response.json();

    if (message && this.canSendMessage) {
      const userMessage: Message = {text: message, type: MessageType.User};
      this.messages.push(userMessage);

      this.form.get('message').setValue('');
      this.form.updateValueAndValidity();
      this.getBotMessage();
    }
  }

  private  getBotMessage(): void {
    this.canSendMessage = false;
    const waitMessage: Message = {type: MessageType.Loading};
    this.messages.push(waitMessage);

    setTimeout(() => {
      this.messages.pop();
      const botMessage: Message = {text: 'Hello! How can I help you?', type: MessageType.Bot};
      this.messages.push(botMessage);
      this.canSendMessage = true;
   }, 2000);
  }

  public onClickEnter(event: KeyboardEvent): void {
    event.preventDefault();
    this.onClickSendMessage();
  }

  private scrollToBottom(): void {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }
}
