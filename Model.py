from json import dumps
from flask import Flask, make_response, request
from flask_cors import CORS
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
from nltk.classify import SklearnClassifier
from nltk.corpus import stopwords
import nltk
import numpy as np  # linear algebra
import pandas as pd  # data processing, CSV file I/O (e.g. pd.read_csv)

from sklearn.feature_extraction.text import CountVectorizer
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from keras.models import Sequential
from keras.layers import Dense, Embedding, LSTM, SpatialDropout1D
from sklearn.model_selection import train_test_split
from keras.utils.np_utils import to_categorical
import re

import os


def sentiment_analyzer_scores(testInput):
    os.getcwd()

    data = pd.read_csv('./Sentiment.csv')
    # Keeping only the neccessary columns
    data = data[['text', 'sentiment']]

    data = data[data.sentiment != "Neutral"]
    data['text'] = data['text'].apply(lambda x: x.lower())
    data['text'] = data['text'].apply(
        (lambda x: re.sub('[^a-zA-z0-9\s]', '', x)))

    print(data[data['sentiment'] == 'Positive'].size)
    print(data[data['sentiment'] == 'Negative'].size)

    for idx, row in data.iterrows():
        row[0] = row[0].replace('rt', ' ')

    max_fatures = 2000
    tokenizer = Tokenizer(num_words=max_fatures, split=' ')
    tokenizer.fit_on_texts(data['text'].values)
    X = tokenizer.texts_to_sequences(data['text'].values)
    X = pad_sequences(X)

    embed_dim = 128
    lstm_out = 196

    model = Sequential()
    model.add(Embedding(max_fatures, embed_dim, input_length=X.shape[1]))
    model.add(SpatialDropout1D(0.4))
    model.add(LSTM(lstm_out, dropout=0.2, recurrent_dropout=0.2))
    model.add(Dense(2, activation='softmax'))
    model.compile(loss='categorical_crossentropy',
                  optimizer='adam', metrics=['accuracy'])
    print(model.summary())

    Y = pd.get_dummies(data['sentiment']).values
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=0.33, random_state=42)
    print(X_train.shape, Y_train.shape)
    print(X_test.shape, Y_test.shape)

    batch_size = 32
    model.fit(X_train, Y_train, epochs=7, batch_size=batch_size, verbose=2)

    validation_size = 1500

    X_validate = X_test[-validation_size:]
    Y_validate = Y_test[-validation_size:]
    X_test = X_test[:-validation_size]
    Y_test = Y_test[:-validation_size]
    score, acc = model.evaluate(
        X_test, Y_test, verbose=2, batch_size=batch_size)
    print("score: %.2f" % (score))
    print("acc: %.2f" % (acc))

    pos_cnt, neg_cnt, pos_correct, neg_correct = 0, 0, 0, 0
    for x in range(len(X_validate)):

        result = model.predict(X_validate[x].reshape(
            1, X_test.shape[1]), batch_size=1, verbose=2)[0]

        if np.argmax(result) == np.argmax(Y_validate[x]):
            if np.argmax(Y_validate[x]) == 0:
                neg_correct += 1
            else:
                pos_correct += 1

        if np.argmax(Y_validate[x]) == 0:
            neg_cnt += 1
        else:
            pos_cnt += 1

    print("pos_acc", pos_correct/pos_cnt*100, "%")
    print("neg_acc", neg_correct/neg_cnt*100, "%")

    # twt = ['NancyLeeGrahn: How did everyone feel about the Climate Change question last night? Exactly']
    # vectorizing the tweet by the pre-fitted tokenizer instance
    twt = testInput
    text = twt
    twt = tokenizer.texts_to_sequences(twt)
    # padding the tweet to have exactly the same shape as `embedding_2` input
    twt = pad_sequences(twt, maxlen=28, dtype='int32', value=0)
    print(twt)
    sentiment = model.predict(twt, batch_size=1, verbose=2)[0]
    if(np.argmax(sentiment) == 0):
        print("negative")
        return "negative"
    elif (np.argmax(sentiment) == 1):
        print("positive")
        return "positive"

    text = ''.join(text)
    print(text)
    text1 = text.split()
    print(text1)

    # wordcloud = WordCloud(width=1000, height=500).generate(" ".join(text1))
    # plt.figure(figsize=(15, 8))
    # plt.imshow(wordcloud)
    # plt.axis("off")
    # plt.show()


app = Flask(__name__)
cors = CORS(app)


@app.route('/getSentiment', methods=["POST", "OPTIONS"])
def getSentiment():

    if request.method == "OPTIONS":  # CORS preflight
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    elif request.method == 'POST':
        print("dasdsadasdaasd")
        print(request)
        text = request.form["text"]
        print(text)
        results = sentiment_analyzer_scores(text)
        # results = "positive"
        return _corsify_actual_response(make_response(results))


def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == '__main__':
    app.run('localhost', 5000)
