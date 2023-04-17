'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//口座の動きを確認する
const displayMovements = function(movements,sort = false){ //必ずハードコーデイィングではなくて関数を作る癖をつけましょう。 //sortをfalseにしたのは、ボタンをクリックすることでこの関数を呼び出すようにしたいからだよ
  containerMovements.innerHTML = ""; //普通にいつもその初期化。　テキストコンテントみたい。

  const moves = sort ? movements.slice().sort((a,b) => a - b) : movements;//ここでslice()を使う理由は、コピーを作成するからです

  moves.forEach(function(mov,i){ //それぞれのアカウントのmovementsの配列があるよね。
    const type = mov > 0 ? "deposit" : "withdrawal"; //三項演算子ですよ。だいぶ慣れた、

     const html = `
       <div class="movements__row">
         <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
         <div class="movements__value"> ${mov.toFixed(2)}€</div>
       </div>
     `; //こんな感じで使えるから、テンプレートリテラルはめっちゃ便利。typeはそれによって、cssが変わるから、クラス名に入れることもできる。インデックスは+1するのは０ベースだからね。
     containerMovements.insertAdjacentHTML("afterbegin",html);//これが結構新しい概念かも。containerMovementsは上にグローバル関数が作られている。insertAdjacentHTMLっていうのは、それをhtml上に表示させるためのやり方。afterbeginがbeforeendをよく使うんだけど、afterbeginだと新しい情報が上から降りてくる感じ。
  })
}


  const calcDisplayBalance = function(acc){ //配列全体を渡すように修正した。
    acc.balance = acc.movements.reduce((acc,mov) => acc + mov,0);//大嫌いなアロー関数で綺麗にまとめた。第二引数忘れないで
    //いちいちbalanceに閉じ込めないで、ここでそのままプロパティを取得でき料に修正。
    labelBalance.textContent = `${acc.balance.toFixed(2)} EUR`;//これほんと便利ね。textContent.labelBalanceって反対にしちゃったから気をつけようね。ちなみにジョナスが全部上でまとめてくれたから。アカウント全体を渡すようにしたからここでおacc.って書くの忘れないでね。
  };

  //実はアカウントによって金利が違うんです。だからそれを書き直しました。
  const calcDisplaySummary = function(acc){//アカウント全体を渡している
    const incomes = acc.movements　//アカウントのうちのmovementsを使う
      .filter(mov => mov > 0)
      .reduce((acc,mov)=> acc + mov, 0);
    labelSumIn.textContent = `${incomes.toFixed(2)}€`;

    const outcomes = acc.movements　//アカウントのうちのmovementsを使う
      .filter(mov => mov < 0)
      .reduce((acc,mov)=> acc + mov, 0);
    labelSumOut.textContent = `${Math.abs(outcomes.toFixed(2))}€`; //Math.absは絶対値のabslutly

    const interest = acc.movements //利息は預け入れの金額に対して1.2％の利子がつく計算らしい。
      .filter(mov => mov > 0)
      .map(deposit => deposit * acc.interestRate/100) ////アカウントのinterestRateを使って計算する
      .filter((int,i,arr) =>{
        // console.log(arr);//(5) [2.4, 5.4, 36, 0.84, 15.6]となる。4つ目は１より小さいよね。
        return int >= 1; //利子が１より小さい場合は除外するらしい。
      })
      .reduce((acc,int) => acc + int ,0) ;
      labelSumInterest.textContent = `${interest}€`;
  };

  const createUsernames = function(accs){
    accs.forEach(function(acc){
      acc.username = acc.owner //このownerというのは下の。
        .toLowerCase()
        .split(" ")
        .map(name => name[0])
        .join("");
    })};
createUsernames(accounts);

//動きによって、下の表示が変わるようにここでUI化
const updateUI = function(acc){ //一つの関数にまとめる。引数はaccountのaccにすればオッケーよ
  //それぞれのアカウントのお金の流れを、スクロールするところに表示させる
  displayMovements(acc.movements);
  //右上に全ての預金動きを合計して表示させる
  calcDisplayBalance(acc);
  //下にそれぞれの合計や、金利などを表示させる。
  calcDisplaySummary(acc);
}


///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener("click",function(e){
  //フォームが送信されないようにする。preventDefaultは規定のアクションを通常通りに行うべきではないことを伝える。
  e.preventDefault();
  console.log("LOGIN");
//currentAccountはここで。letで外部宣言しているからconstはいらないよ。
//ここからはユーザー名があっているかの確認です。
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value); //入力されたusernameと等しいことを確認する。そしてvalueを忘れないで。入力フィールだから値を読み込むためには必要です。acc.usernameなのは、上のcreateUsernamesで頭文字をとって作成する関数を作っているからだよ。
console.log(currentAccount);//自分のやつがあっているか確かめよう。

//ここからはpinと等しいかを確認するところ。
if(currentAccount?.pin === +(inputLoginPin.value)){ //どうしてnumberを付けるかというと、valueは常に文字列になるため。pinは数字だったよね。
  //もしここでユーザー名を空欄にしたり間違ったやつを売ったり、pinを打たないとエラーが出ますよ。ではそのエラーをどのように解消すればいいのか。
  //まず思いつくのは、そのアカウントが存在するかを確かめること。オプショナル・チェーンを使おう
  //「?.」この演算子すっかり忘れていたけど何これ。調べました。
  //nullやundefinedの時にエラーになるのではなく、式が短略され、undefinedだけが返されるところ。エラーになったらいちいちめんどくさいしね。
  // console.log("PIN LOGIN");
  // welcome message
   labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(" ")[0]}`;
   //ログインすると、上のメッセージ部分がこのようになる。いくらやっても覚えられあいね、splitはそこで指定された文字で区切ること。その０番目だから最初の名前だけ表示されるんだね。miyaとかjonasとか名前だけ。
   //ここでログインができてから下に口座の動きが見えてくるんだよね。
   containerApp.style.opacity = 100; //ここで透明度の操作をする。
   //このcontainerAppとはクラス名にappがついているものを指定する。cssでopacityを変化させることのクラス名はappだった。天才！
//すごくて天才かと思った
//それでは次に、ログインをした後に、ユーザー名のところとpinのところを空にするやり方をやります。
  inputLoginUsername.value = inputLoginPin.value = ""; //これで空になりました。value忘れないで！
  //pinのところに残っているカーソルのフォーカスを外すやり方。
  inputLoginPin.blur();//blur()とは⇨フォーカスを当てている状態から外したタイミングで実行されるイベントです。

  updateUI(currentAccount); //今まではここに案数を一つ一つ書いていたけど,updateUIという一つの関数にまとめて、それを呼び出す形にしたのだ。

}

}); //form要素のいいところは、入力してエンターキーを押すと実際にそのクリックイベントが自動的に紐付くこと。自分でclickを書く必要がないところは楽でいいと思います。

//他のユーザーへの送金ができますので、ここで実装していきます。右側にある黄色いところです。
btnTransfer.addEventListener("click",function(e){
  e.preventDefault(); //デフォルトの操作を制御する。さっきもやったね

  const amount = +(inputTransferAmount.value);//要素を見るとinputTransferAmountは金額を入力するところなので、numberを入れます。いつものことですが、valueも忘れないでください。
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  //ここは少しややこしいけど、金額の送付先を入れるので、accountsの全てのアカウントの配列から探す、として、accountsのusernameが送金先のアカウント名と一致しているかを===の等号演算子で確認をしています。
  console.log(amount,receiverAcc);//これで入力された送金金額と、送金先の受け取りユーザーがちゃんとあっているかを確認します。。
  //それに、自分の持っているお金よりも高い金額は振り込めないですよね。だからそこもチェックします。それに送る金額はネガティブになってはダメです。

  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&  //送る金額が0円以上か
    receiverAcc &&//送る相手が存在するかどうか。存在するアカウントに送らないといけないからね。
    currentAccount.balance >= amount && //送り元の 預金が送る金額よりも上か
    receiverAcc?.username !== currentAccount.username)//オプチョナルチェーンを使って、receiverAccがぞんざいするときにって感じ
  {
    // console.log("Trnsfer valid");//これは確認ようにやっているんだけど、自分の預金額よりも多い数だと、これはログに表示されないよ

    //そうしたら、これを送ったユーザーは預金が減って、受け取ったユーザーの預金が増えることは当たり前ですよね。
    currentAccount.movements.push(-amount); //-だからここで数が減ってます
    receiverAcc.movements.push(amount); //pushをするので、movementsの配列に後ろから付け足すイメージです
    updateUI(currentAccount); //変更になりましたから、ここでももう一回関数を読んで表示させないとですね。さすがです
  }
});

//Request Loan のところ。融資依頼
//「融資希望額の10%以上の預金が一つ以上ないと融資しない」というルールになっている。
btnLoan.addEventListener("click",function(e){
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); //ローン融資の時に、小数点以下切り下げのようにする

  if(
    amount > 0 && //融資希望額が0円以上で、
    currentAccount.movements.some(mov => mov >= amount * 0.1)//現在のアカウントのムーブのなかに融資希望額の10%以上の学があれば
  ){
    //ムーブメントに動きを足す
    currentAccount.movements.push(amount); //ムーブメントのところに追加

    updateUI(currentAccount);//一つの関数にまとめたね。下の3つの動きをこれでまとめて動かしている
  }
  inputLoanAmount.value = "";  //入力したとことをこれで空にしている

});

btnClose.addEventListener("click",function(e){
    e.preventDefault(); //デフォルトの動きを抑制
    // console.log("Click! YAAAAS");
    if(
      inputCloseUsername.value === currentAccount.username & //close account のところに入力されたアカウント名が一致
      +(inputClosePin.value) === currentAccount.pin　//close account のところに入力されたpinが一致
    ){
      const index = accounts.findIndex(acc => acc.username === currentAccount.username);//findIndexはfindと似ているけど、要素のindexを返すんだよ。これなんかindexOfに似ていない？
      console.log(index); //これは入力された値がaccounts配列の何番目の要素かを出してくれる。もしこれがjs,1111だったら、account配列の最初だから、ログは0と表示される。
      //これがindexOFと似ている件についてですが、indexOFは配列の中にある値しか検索できないこと。複雑な条件を作る場合は、indexOfではなく、findIndexを使う必要があります。

      //アカウント削除
      accounts.splice(index,1);//spliceは元の配列も変えてしなうから、この結果をどこかに保存しておく必要はないです。これでちゃんと消えました。（もちろんリロードしたらいけるよ）

      //画面を白く戻す
      containerApp.style.opacity = 0;
    }

    inputCloseUsername.vaue = inputClosePin.value = ""; //まぁ見えないんだけど、ここで入力したところを空にするわけです。
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

//上記のことは、ひとつ前のセクションでやってあるため割愛。しようと思ったが、置き換えました。私のメモが書いてあるからわかりやすいと思う。
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//Converting and Checking Numbers
//jsでは、 整数で書いても小数で書いても、基本的に「常に小数」であること

console.log(23 === 23.0); //trueとなる。

//そして内部では64進数。数値は常に２進数で保存されます。
//数字の表示の仕方ですが、下の２パターンがあります。
console.log(Number("23"));
console.log(+"23");

//parsingとは　文字列から数字を読み解くことができます。このparseIntのIntは「整数」という意味.
console.log(Number.parseInt("30px",10)); //30 これは30と「数字」で認識される。
console.log(Number.parseInt("e23",10));//Nanとでる。これは数字で文字列を始める必要があるからです。
//でも必ず文字列で始めないといけないってめんどくさくない？
//実は、parseIntは第二引数を受け付けます。これは正規表現です。私たちは普段10芯数を使っているから10といれる。これによって状況によってはバグを回避できる可能性がある。

//parseFloatで「小数」を表す
console.log(Number.parseFloat("2.5rem"));//2.5
console.log(Number.parseInt("2.5rem")); //2。少数のところは無視される


//isNaNかをチェックする。Not a Numberの略。返却はブール値
//このメソッドは、値が「数値ではないことを確認」するためにのみ使用。
console.log(Number.isNaN(20)); //false。なぜなら「数値」だから。わかる？isNaN = 数字ではない
console.log(Number.isNaN("20")); //false。なぜなら「数値」だから
console.log(Number.isNaN(+"20px")); //true
console.log(Number.isNaN(23/ 0 ));//Infinityという値だから、falseになる

//isFinite.値が無限かどうかを調べる。返却はブール値。有限ならtrue。無限ならfase
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite("20")); //false 「数値」じゃないから
console.log(Number.isFinite(+"20X")); //false　「数値」じゃないから
console.log(Number.isFinite(23 / 0)); //false 無限のため

//isInteger 値が整数かどうかを返す。
console.log(Number.isInteger(3)); //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23 / 0)); //false　

//////////////////////////////////////////////////////////
//171.Math and Rounding
console.log("---171 lecture ---");
//Math.sqrtとは平方根を表す
console.log(Math.sqrt(25)); //5 ルート２みたいな感じ?
console.log(25 ** (1/2));//5　これでも５とでる. **は右上の小さい数字のこと。二乗ってこと。ノエルに教えてもらった
console.log(8 ** (1/3)); //1/3というのは立方体ということです。

console.log(Math.max(5,18,23,1,5));  //23 一番大きい数を返す
console.log(Math.min(1,2,3,4,5)); //1と表示。一番小さい数を表示

console.log(Math.PI * Number.parseFloat("10px") ** 2); //Math.PIは円周率のこと。これで円の面積を求めることができる。

console.log(Math.random()) //乱数の生成。引数に何も入れないと0から１の中での乱数が生成される
console.log(Math.trunc (Math.random() * 6)); //０から６の整数の乱数が生成される
console.log(Math.trunc (Math.random() * 6) + 1);  //これで０を含まなくなった

//二つの整数の間の乱数を生成するようにしましょう
const randamInt = (min,max) => Math.floor(Math.random() *(max - min) + 1) + min;
//なぜこのようにmax- min とするかというと、いつも0から１の間が出るということは、1-0ってことじゃんか。そうなのか？
console.log(randamInt(10,20)); //これで10から20の間の整数を作ることができました。

//Rounding integer　四捨五入
console.log(Math.trunc(23.3)); //23。小数点以下切り捨て　

console.log(Math.round(23.3)); //23
console.log(Math.round(23.9)); //24 Math.roundは四捨五入のこと

//Math.ceil 小数点以下切り上げ
console.log(Math.ceil(23.3)); //24
console.log(Math.ceil(23.9));  //24

//Math.floor 小数点以下切り下げ
console.log(Math.floor(23.3)); //23
console.log(Math.floor(23.9)); //23

//こうなるとMath.trunc(小数点以下切り捨て)とMath.floor(小数点以下切り下げ)は一緒なんじゃないかという疑問が生まれる
//ここで差が生まれるのがネガティブな値の扱い方
console.log(Math.trunc(-23.3)); //-23 truncは絶対に捨てる
console.log(Math.floor(-23.3));  //-24　ネガティブだと反対に働く。「現在の値{以下}で一番大きな整数を示すから

//浮動小数点について
console.log((2.7).toFixed(0)); //3 しかも文字列になります。
console.log((2.7).toFixed(3));  //2.700 小数点以下が３桁になるまで0がたされる
console.log((2.7).toFixed(1));  //2.7 小数点以下一桁

//////////////////////////////////////////////////////////
//172.The Remainder Operator あまり演算子、割り算のあまりを返す演算子

console.log(5 % 2); //1 あまりを表示する
console.log(8 % 3); //2

console.log(6 % 2); //0  偶数だから

//奇数か偶数かを確認するのにちょうどいい。
const isEven = n => n % 2 === 0; //偶数ならtrueと返す関数を作成
console.log(isEven(8)); //true
console.log(isEven(23)); //false
console.log(isEven(1)); //false

//右上の合計金額のところを押したら、偶数列の動きがオレンジ色になるというスタイルにしてみた
labelBalance.addEventListener("click",function(){
  [...document.querySelectorAll(".movements__row")].forEach(function(row,i){
    if (i % 2 === 0) row.style.backgroundColor = "orangered";　//２の倍の列をオレンジに
    if (i % 3 === 0) row.style.backgroundColor = "pink"; //３の倍の列をピンクに
  });
});
//スプリットオペレーターにして、それ全体をforEachでループさせる。
//列を引数にとり、それの値が２で割り切れる偶数であれば、背景をオレンジ色に変える
//every n timeというときは余剰演算子を使うのがいいと思います。

//////////////////////////////////////////////////////////
//173.Numeric Separators
//他の開発者がわかりやすいように、数字をフォーマットすることができます。　


const diameter = 287460000000; //このままだと読みづらいし、理解しづらいよね。
//これだったら287,460,000,000ってコンマで区切ったりするよね。
const diameterStudies = 287_460_000_000; //アンダースコアで区切ります。しかもどこでもいいんだよ。
console.log(diameterStudies); //287460000000と表示される

const priceCents = 345_99;
console.log(priceCents); //数字のある部分に意味を持たせる音ができる。34599

const transferFee = 15_00;

const PI = 3.14_15;
console.log(PI); //3.1415　アンダースコアは数字と数字の間にしかおけない.先頭とか末尾もだめ

console.log(Number("23_000")); //実はNumber関数にアンダースコアを入れるとNaNとなる。数字ではなくなる

//////////////////////////////////////////////////////////
//174.Working with BigInt
console.log(2 ** 53 - 1); //9007199254740991これが保存できる一番大きな数。
console.log(Number.MAX_SAFE_INTEGER); //9007199254740991の結果。jsが安全に表示できる最大の整数

//しかし状況によってはこれ以上の大きな数字を扱わなければいけないこともあります。DBのIDとかね
console.log(2345678900987654321234567n); //末尾にnをつけるとBigIntの意味になる コンソール上の見た目も変わる
console.log(BigInt(4567543456787654345676543456)); //BigInt関数を使うこともできます

//この知識を使ったいくつかの操作
console.log(10000n + 10000n); //BigIntでも演算子は使えます
console.log(345676543456765434567n * 567654567654456n); //BigInt同士の計算もできる

const huge = 234532345323456n;
const num = 10;
// console.log(huge * num); //これはエラーになる。型が違う同士の計算はできません。
console.log(huge * BigInt(num)); //これならできます。

//例外集
console.log(28n > 15); //true
console.log(20n === 20); //false これは普通のかずとBigIntの型が違うのでfalseになります。
console.log(20n == 20); //true　イコールが2つだと精度が下がってOKになる

//文字列の連結の例外
console.log(huge + " IS REALLY BIG"); //普通に表示される

console.log(10n /3n); //3nとなる
