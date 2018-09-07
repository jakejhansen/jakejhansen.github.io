# Master Thesis - Project Plan

### Project Goals

![1535909468772](assets/1535909468772.png)

* Using camera sensors from **TM4** (trackman 4), try to detect which club is being used. Both main categories and if possible also sub categories.
* **Detection Step**: crop the image using a very small NN, *mobileNET* or standard CV techniques
* **Preprocess Step**: Use preprocessing to assist in making the *classification step* easier
* **Classification Step:** Using the cropped images, try to identify club type. Use majority vote over many frames.
* **Embed Device**: Take the network and try to execute it on an embedded device
* **Shooting Position**: Try to identify club category (4 types) from the shooting position



#### Metrics

We need to decide on desired and measurable metrics for the overall system. The users will have little use of the system if it has poor performance. Following is initial gut feeling:

* **Detection**: We desire an acceptable crop (80% of club should be within the crop and 50% of the crop should contain the club) in 90% of the crops. I.e, the crop shouldn't be too large but it should not zoom too much in either.
* **Basic Classification**: For 4 main categories of clubs we specify an accuracy of **95%** as being acceptable
* **Extended Classification**: For the irons, we specify an accuracy of **90%** as being acceptable
* **Embedded device**: Need an FPS of 7 (it's ok to not process every single frame) and a **85%** accuracy.



### Overall Project Plan

| Week  | Activity                                                     | Risk |
| ----- | :----------------------------------------------------------- | ---- |
| 1     | Project plan, data analysis and brain storm                  | 3    |
| 2+3   | Literature study and enhanced project plan                   | 1    |
| 2+3   | Data annotation (for detection step)                         | 2    |
| 3     | Basic model (detection) \|**Correct crop 9/10 times**        | 2    |
| 4     | Basic model (classification, transfer learning) - 4 categories of clubs \| **95% Acc** | 3    |
| 5     | Larger classification model (more types) \| **90% Acc**      | 4    |
| 6     | Combination of models                                        | 2    |
| 7-8   | Improvement of model with more elaborate preprocessing and multiple training runs | 3    |
| 9-10  | Run on embeded device (maybe shrink and try smaller networks) | 4    |
| 11-14 | Detect from shooting position.                               | 4    |
| 14-16 | Finishing touches and finishing report (time buffer)         | 2    |

#### Risk Analysis

In the plan the risk is classified using a scale from 1 (no risk) to 5 (high risk).
The risk is described as the chance of the activity being delayed.

* High risk is data gathering, annotation and analysis. The is a very good chance that there is too little data to really do much besides simple category classification of 4 types of clubs. Furthermore there is a good chance that the data can be messy and annotation / labeling is very time consuming. 
* Detection should output a bounding box, the task should be rather straight forward
* Classification step is where we will really see if we have enough data. Detection 4 different types of clubs at 95% accuracy should be doable. Expanding the number of outputs on the neural network or creating more NN's for further detection (not desired in hardware) is very data demanding. If the bottleneck is the data, there is little I can do from a model perspective. 
* Improving model can be time consuming and setting up environment for multiple runs with spaced hyper param search is not something I have much experience in. It also requires significant computational resources if it should be fast.
* Embeded device can be very hard depending on the configuration at trackman. If I'm given a device that is ready to go it is easy. If I have to start from scratch installing driver etc for webcam it can take a surprising amount of time. 
* Detect on shooting performance depends on the data and how much we can see.



## Status

- [x] Write initial project plan
- [ ] Analyze data
- [ ] Initial literature study
- [ ] Updated and scoped project plan
- [ ] Basic detection model
- [ ] Preprocessing (classic computer vision techniques)
- [ ] Basic classification model
- [ ] Expanded model
- [ ] Setup Jetson TX2 / TM4
- [ ] Run Model on embed platform
- [ ] Optimize for embedded performance (how accurate can we get?)
- [ ] Detection from shooting position